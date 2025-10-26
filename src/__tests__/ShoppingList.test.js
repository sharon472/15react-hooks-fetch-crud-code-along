import "whatwg-fetch";
import "@testing-library/jest-dom";
import {
  render,
  screen,
  fireEvent,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { resetData } from "../mocks/handlers";
import { server } from "../mocks/server";
import ShoppingList from "../components/ShoppingList";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  resetData();
});
afterAll(() => server.close());

test("displays all the items from the server after the initial render", async () => {
  render(<ShoppingList />);

  expect(await screen.findByText(/Yogurt/i)).toBeInTheDocument();
  expect(await screen.findByText(/Pomegranate/i)).toBeInTheDocument();
  expect(await screen.findByText(/Lettuce/i)).toBeInTheDocument();
});

test("adds a new item to the list when the ItemForm is submitted", async () => {
  const { rerender } = render(<ShoppingList />);

  const dessertCount = screen.queryAllByText(/Dessert/i).length;

  fireEvent.change(screen.getByLabelText(/Name/i), {
    target: { value: "Ice Cream" },
  });

  fireEvent.change(screen.getByLabelText(/Category/i), {
    target: { value: "Dessert" },
  });

  fireEvent.click(screen.getByText(/Add Item/i));

  expect(await screen.findByText(/Ice Cream/i)).toBeInTheDocument();

  const desserts = await screen.findAllByText(/Dessert/i);
  expect(desserts.length).toBe(dessertCount + 1);

  rerender(<ShoppingList />);
  expect(await screen.findByText(/Ice Cream/i)).toBeInTheDocument();
});

test("updates the isInCart status of an item when Add/Remove button is clicked", async () => {
  const { rerender } = render(<ShoppingList />);

  const addButtons = await screen.findAllByText(/Add to Cart/i);
  expect(addButtons.length).toBe(3);

  expect(screen.queryByText(/Remove From Cart/i)).not.toBeInTheDocument();

  fireEvent.click(addButtons[0]);
  expect(await screen.findByText(/Remove From Cart/i)).toBeInTheDocument();

  rerender(<ShoppingList />);
  expect(await screen.findAllByText(/Add to Cart/i)).toHaveLength(2);
  expect(await screen.findAllByText(/Remove From Cart/i)).toHaveLength(1);
});

test("removes an item from the list when the delete button is clicked", async () => {
  const { rerender } = render(<ShoppingList />);

  expect(await screen.findByText(/Yogurt/i)).toBeInTheDocument();

  const deleteButtons = await screen.findAllByText(/Delete/i);
  fireEvent.click(deleteButtons[0]);

  await waitForElementToBeRemoved(() => screen.queryByText(/Yogurt/i));

  rerender(<ShoppingList />);
  expect(await screen.findAllByText(/Delete/i)).toHaveLength(2);
  expect(screen.queryByText(/Yogurt/i)).not.toBeInTheDocument();
});
