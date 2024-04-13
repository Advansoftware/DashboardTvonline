import { json } from '@sveltejs/kit';

// src/routes/api/cronjob.js
export async function GET({request}) {
  // Sua lógica de cron job aqui
  let results =  {
    status: 200,
    body: 'Cron job executado com sucesso!'
  };
    return json(results);
}
