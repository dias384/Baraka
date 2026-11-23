
export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": "https://dias384.github.io",
      "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json; charset=utf-8"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }

    if (request.method === "GET") {
      return Response.json({
        status: "ok",
        assistant: "Baraka",
        message: "Le serveur Baraka est prêt."
      }, { headers: cors });
    }

    if (request.method !== "POST") {
      return Response.json({ error: "Méthode non autorisée." },
        { status: 405, headers: cors });
    }

    try {
      const body = await request.json();

      if (!Array.isArray(body.messages) || !body.messages.length) {
        return Response.json({ error: "Message manquant." },
          { status: 400, headers: cors });
      }

      const messages = body.messages
        .filter(m => m &&
          ["user", "assistant"].includes(m.role) &&
          typeof m.content === "string")
        .slice(-10)
        .map(m => ({
          role: m.role,
          content: m.content.slice(0, 3000)
        }));

      if (messages[messages.length - 1]?.role !== "user") {
        return Response.json({ error: "Message utilisateur manquant." },
          { status: 400, headers: cors });
      }

      const result = await env.AI.run(
        "@cf/meta/llama-3.1-8b-instruct-fast",
        {
          messages: [
            {
              role: "system",
              content: "Tu es Baraka, un assistant personnel bienveillant, intelligent et utile. Tu réponds en français, clairement et naturellement. Tu aides à organiser les idées, les projets et les tâches. Tu respectes la foi de l'utilisateur sans prétendre parler au nom de Dieu. Tu es honnête et concis."
            },
            ...messages
          ],
          max_tokens: 700
        }
      );

      return Response.json({
        reply: result.response || result.output_text || "Je n'ai pas pu répondre."
      }, { headers: cors });

    } catch (error) {
      return Response.json({
        error: "Erreur du serveur IA. Vérifie la configuration."
      }, { status: 500, headers: cors });
    }
  }
};
