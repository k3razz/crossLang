export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // ==========================================
    // 1. API РОУТЫ (начинаются с /api/)
    // ==========================================
    if (path.startsWith('/api/')) {
      // Пример: /api/status -> возвращаем статус (можно взять из JSON или сгенерировать)
      if (path === '/api/status') {
        // В реальности вы можете читать api/status.json из ассетов
        // Но для примера вернем хардкод:
        return new Response(JSON.stringify([
          { "main": { "status": "beta" } }
        ]), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Другие API роуты (новости, обновления и т.д.)
      if (path === '/api/news') {
        return new Response(JSON.stringify({ "news": ["Добро пожаловать в CrossLauncher!"] }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Если API-роут не найден
      return new Response(JSON.stringify({ error: "API endpoint not found" }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // ==========================================
    // 2. ОТДАЧА СТАТИКИ (HTML, CSS, JS, JSON)
    // ==========================================
    try {
      // Пытаемся получить файл из ассетов
      let response = await env.ASSETS.fetch(request);

      // Если файл не найден (404) и запрос на HTML, можно отдать index.html
      // Но сейчас просто возвращаем то, что есть.
      return response;
    } catch (e) {
      return new Response("Not Found", { status: 404 });
    }
  }
};
