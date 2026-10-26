export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // --- API РОУТЫ ---
    if (path.startsWith('/api/')) {
      const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      };

      if (request.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
      }

      // 1. РЕГИСТРАЦИЯ
      if (path === '/api/register' && request.method === 'POST') {
        const { username, password } = await request.json();
        if (!username || !password) return new Response(JSON.stringify({error: "Заполните все поля"}), {status: 400, headers: {...corsHeaders, "Content-Type": "application/json"}});

        try {
          // В реальности используйте bcrypt/scrypt. Здесь для примера простой хэш.
          const password_hash = btoa(password); 
          const stmt = env.DB.prepare("INSERT INTO users (username, password_hash, role) VALUES (?, ?, 'user')").bind(username, password_hash);
          await stmt.run();
          
          return new Response(JSON.stringify({ success: true, message: "Пользователь создан" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        } catch (e) {
          return new Response(JSON.stringify({ error: "Пользователь уже существует" }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
      }

      // 2. ЛОГИН
      if (path === '/api/login' && request.method === 'POST') {
        const { username, password } = await request.json();
        const password_hash = btoa(password);

        const { results } = await env.DB.prepare("SELECT * FROM users WHERE username = ? AND password_hash = ?").bind(username, password_hash).all();

        if (results.length > 0) {
          // В реальном проекте генерируйте JWT токен. Здесь просто возвращаем username.
          return new Response(JSON.stringify({ success: true, username: results[0].username, token: btoa(username) }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        } else {
          return new Response(JSON.stringify({ error: "Неверный логин или пароль" }), {
            status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
      }

      // 3. ПОЛУЧЕНИЕ ДАННЫХ ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ
      if (path === '/api/me' && request.method === 'GET') {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader) return new Response(JSON.stringify({error: "Не авторизован"}), {status: 401, headers: {...corsHeaders, "Content-Type": "application/json"}});
        
        const token = authHeader.replace("Bearer ", "");
        const username = atob(token); // Декодируем наш "токен" обратно в юзернейм

        const { results } = await env.DB.prepare("SELECT username, role, created_at FROM users WHERE username = ?").bind(username).all();
        
        if (results.length > 0) {
          const user = results[0];
          // Форматируем дату
          const date = new Date(user.created_at).toLocaleDateString('ru-RU');
          return new Response(JSON.stringify({ username: user.username, role: user.role, register_date: date }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        } else {
          return new Response(JSON.stringify({error: "Пользователь не найден"}), {status: 404, headers: {...corsHeaders, "Content-Type": "application/json"}});
        }
      }

      // Если API роут не найден
      return new Response(JSON.stringify({error: "Not Found"}), {status: 404, headers: {...corsHeaders, "Content-Type": "application/json"}});
    }

    // --- ОТДАЧА СТАТИКИ ---
    return env.ASSETS.fetch(request);
  }
};
