import { MessageType } from "@/components/types";
import { openai } from "@/lib/openAIClient";
import { supabase } from "@/lib/supabaseClient";
import { genAI } from "@/lib/geminiClient";

export async function addExchange(
  prompt: string,
  userId: string,
  topicId?: string,
  lastMessage?: MessageType
) {
  if (lastMessage && topicId) {
    try {
      let completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "user", content: lastMessage.prompt },
          { role: "assistant", content: lastMessage.response },
          { role: "user", content: prompt },
        ],
      });
      completion.choices;
      const { data, error } = await supabase.rpc("add_exchange", {
        prompt,
        topic_id: topicId,
        response: completion.choices[0].message,
        parent_thread_id: lastMessage.message_id,
      });
      if (error) {
        throw error;
      }
      //
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  } else {
    try {
      let completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
      });
      completion.choices;
      const { data, error } = await supabase.rpc("start_convo", {
        prompt,
        response: completion.choices[0].message,
        user_id: userId,
      });
      if (error) {
        throw error;
      }
      //
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  }
}

export async function addExchangeGe(
  prompt: string,
  userId: string,
  topicId?: string,
  lastMessage?: MessageType
) {
  if (lastMessage && topicId) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      let chat = model.startChat({
        history: [
          {
            role: "user",
            parts: [{ text: lastMessage.prompt }],
          },
          {
            role: "model",
            parts: [{ text: lastMessage.response }],
          },
        ],
      });
      let { response } = await chat.sendMessage(prompt);
      const { data, error } = await supabase.rpc("add_exchange", {
        prompt,
        topic_id: topicId,
        response: response.text(),
        thread_parent_id: lastMessage.message_id,
        sibling_id: null,
      });
      if (error) {
        throw error;
      }
      //
      return data;
    } catch (error) {
      console.log(error);
    }
  } else {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      let chat = model.startChat({});
      let { response } = await chat.sendMessage(prompt);
      console.log(response.text());
      const { data, error } = await supabase.rpc("start_convo", {
        prompt,
        response: response.text(),
        user_id: userId,
      });
      if (error) {
        throw error;
      }
      //
      return data;
    } catch (error) {
      console.log(error);
    }
  }
}
export async function editMessage(
  edit: string,
  promptId: string,
  topicId: string,
  parentThreadId: string | null
) {
  try {
    let completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: edit }],
    });
    completion.choices;
    const { data, error } = await supabase.rpc("edit_message", {
      prompt,
      response: completion.choices[0].message,
      sibling_id: promptId,
      parent_thread_id: parentThreadId || null,
      topic_id: topicId || null,
    });
    if (error) {
      throw error;
    }
    //
    console.log(data);
  } catch (error) {
    console.log(error);
  }
}

export async function editMessageGe(
  edit: string,
  promptId: string,
  topicId: string,
  parentThreadId: string | null
) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    let chat = model.startChat({});
    let { response } = await chat.sendMessage(edit);
    console.log(response);
    const { data, error } = await supabase.rpc("edit_message", {
      prompt: edit,
      response: response.text(),
      sibling_id: promptId,
      thread_parent_id: parentThreadId || null,
      topic_id: topicId || null,
    });
    if (error) {
      throw error;
    }
    //
    return data;
  } catch (error) {
    console.log(error);
  }
}

export function parentIdFinder(
  data: Array<MessageType> | undefined,
  path: Array<number>,
  level: number
): string | null {
  if (!data) {
    return null;
  }
  path = path.slice(0, level);
  let parentId = null;
  console.log(path, level);
  for (let i = 0; i < path.length; i++) {
    parentId = data[path[i]].message_id;
    data = data[path[i]].children;
  }
  return parentId;
}
