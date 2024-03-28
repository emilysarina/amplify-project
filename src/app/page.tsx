import { generateServerClientUsingCookies } from '@aws-amplify/adapter-nextjs/api';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import * as mutations from '@/graphql/mutations';
import styles from './page.module.css';
// 1. Add the queries as an import
import * as queries from '@/graphql/queries';

import config from '@/amplifyconfiguration.json';

const cookiesClient = generateServerClientUsingCookies({
  config,
  cookies
});

async function createTodo(formData: FormData) {
  'use server';
  const { data } = await cookiesClient.graphql({
    query: mutations.createTodo,
    variables: {
      input: {
        name: formData.get('name')?.toString() ?? ''
      }
    }
  });

  console.log('Created Todo: ', data?.createTodo);

  revalidatePath('/');
}

export default async function Home() {
  // 2. Fetch additional todos
  const { data, errors } = await cookiesClient.graphql({
    query: queries.listTodos
  });

  const todos = data.listTodos.items;

  return (
    <div className={styles.todo}>
      <h1>To do list</h1>
      <form action={createTodo}>
        <input name="name" placeholder="Add a todo" />
        <button type="submit">Add</button>
      </form>

      {/* 3. Handle edge cases & zero state & error states*/}
      {(!todos || todos.length === 0 || errors) && (
        <div>
          <p>No todos, please add one.</p>
        </div>
      )}

      {/* 4. Display todos*/}
      <ul>
        {todos.map((todo) => {
          return <li style={{ listStyle: 'none' }}>{todo.name}</li>;
        })}
      </ul>
    </div>
  );
}