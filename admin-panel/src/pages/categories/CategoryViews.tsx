import { CategoriesPage } from "./CategoriesPage";

/** Menu entries "Main Categories" and "Sub Categories" — the same manager, opened on that list. */
export function MainCategoriesPage() {
  return <CategoriesPage key="main" initialView="main" />;
}

export function SubCategoriesPage() {
  return <CategoriesPage key="sub" initialView="sub" />;
}
