import { rest } from "msw";
import { data } from "./data";

let items = [...data];
let id = items[items.length - 1].id;

export function resetData() {
  items = [...data];
  id = items[items.length - 1].id;
}

export const handlers = [
  // GET all items
  rest.get("http://localhost:3000/items", (req, res, ctx) => {
    return res(ctx.json(items));
  }),

  // POST new item
  rest.post("http://localhost:3000/items", async (req, res, ctx) => {
    const body = await req.json();
    id++;
    const item = { id, ...body };
    items.push(item);
    return res(ctx.json(item));
  }),

  // DELETE item
  rest.delete("http://localhost:3000/items/:id", (req, res, ctx) => {
    const { id } = req.params;
    const itemId = parseInt(id);
    if (isNaN(itemId)) {
      return res(ctx.status(404), ctx.json({ message: "Invalid ID" }));
    }
    items = items.filter((item) => item.id !== itemId);
    return res(ctx.status(200));
  }),

  // PATCH item
  rest.patch("http://localhost:3000/items/:id", async (req, res, ctx) => {
    const { id } = req.params;
    const itemId = parseInt(id);
    if (isNaN(itemId)) {
      return res(ctx.status(404), ctx.json({ message: "Invalid ID" }));
    }

    const body = await req.json();
    const index = items.findIndex((item) => item.id === itemId);
    if (index === -1) {
      return res(ctx.status(404), ctx.json({ message: "Item not found" }));
    }

    items[index] = { ...items[index], ...body };
    return res(ctx.json(items[index]));
  }),
];
