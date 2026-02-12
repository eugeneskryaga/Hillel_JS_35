const api = axios.create({
  baseURL: "https://6971cf4a32c6bacb12c49096.mockapi.io",
});

let pageCounter = 1;
let search = "";
let sortOrder = "asc";

const root = document.querySelector("#root");

const title = document.createElement("h1");

const markup = document.createElement("div");
markup.style.display = "flex";
markup.style.justifyContent = "space-between";
root.append(markup);

const border = "2px solid black";
const padding = "20px";

const bookListContainer = document.createElement("div");
bookListContainer.style.border = border;
bookListContainer.style.padding = padding;
markup.append(bookListContainer);
bookListContainer.append(title);

const sortSelect = document.createElement("select");
sortSelect.style.marginBottom = "5px";
sortSelect.innerHTML =
  "<option value='asc'>From A to Z</option><option value='desc'>From Z to A</option>";

const searchForm = document.createElement("form");
searchForm.innerHTML =
  "<input class='search' type=text name='search' style='margin-right: 5px'><button>Search</button>";

const bookList = document.createElement("ul");
bookListContainer.append(bookList);

bookList.before(searchForm);
searchForm.before(sortSelect);

const pageContainer = document.createElement("div");
pageContainer.style.marginBottom = "5px";
bookListContainer.append(pageContainer);

const addBookBtn = document.createElement("button");
addBookBtn.textContent = "Add Book";
bookListContainer.append(addBookBtn);

const bookDescContainer = document.createElement("div");
bookDescContainer.style.maxWidth = "50%";
markup.append(bookDescContainer);

const notification = document.createElement("div");

async function showBookList() {
  try {
    bookList.innerHTML = "";
    title.textContent = "LOADING...";

    const { data } = await api("/books", {
      params: {
        page: pageCounter,
        limit: 5,
        search,
        sortBy: "title",
        order: sortOrder,
      },
    });

    data.forEach(book => {
      const listItem = document.createElement("li");
      listItem.id = book.id;
      listItem.style.marginBottom = "10px";

      const bookTitle = book.title + " ";

      const detailsButton = document.createElement("button");
      detailsButton.textContent = "View Details";
      detailsButton.style.marginRight = "5px";
      detailsButton.addEventListener("click", event => {
        showDetails(event);
      });

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete book";
      deleteButton.style.marginRight = "5px";
      deleteButton.addEventListener("click", event => deleteBook(event));

      const editButton = document.createElement("button");
      editButton.textContent = "Edit book";
      editButton.addEventListener("click", event => editDescription(event));

      listItem.append(bookTitle, detailsButton, deleteButton, editButton);
      bookList.appendChild(listItem);
    });

    pageContainer.innerHTML = `
    <button class="prev">&lt;</button>
    <strong> ${pageCounter} </strong>
    <button class="next">&gt;</button>`;

    const prevButton = pageContainer.querySelector(".prev");
    const nextButton = pageContainer.querySelector(".next");
    prevButton.addEventListener("click", handlePrevious);
    nextButton.addEventListener("click", handleNext);
    if (pageCounter === 1) {
      prevButton.style.display = "none";
    }
    if (data.length < 5) {
      nextButton.style.display = "none";
    }
  } catch (error) {
    console.log(error);
  } finally {
    title.textContent = "Список книг";
  }
}

async function showDetails(e) {
  bookDescContainer.innerHTML = "";
  bookDescContainer.style.border = border;
  bookDescContainer.style.padding = padding;

  const id = e.target.parentNode.id;
  const button = e.target;
  button.textContent = "Loading...";

  try {
    const { data } = await api(`/books/${id}`);
    bookDescContainer.innerHTML = `
        <h2>${data.title}</h2>
        <p><strong>Автор:</strong> ${data.author}</p>
        <p><strong>Рік видання:</strong> ${data.year}</p>
        <p><strong>Опис:</strong> ${data.description}</p>
      `;
  } catch (error) {
    console.log(error);
  } finally {
    button.textContent = "View Details";
  }
}

async function deleteBook(e) {
  const id = e.target.parentNode.id;

  try {
    e.target.textContent = "Deleteing...";
    await api.delete(`/books/${id}`);
    showBookList();
    showNotification();
  } catch (error) {
    console.log(error);
  } finally {
    e.target.textContent = "Delete book";
  }
}

function showNotification() {
  notification.innerHTML = "";
  clearContainer(bookDescContainer);
  setTimeout(() => {
    notification.innerHTML = "<strong>Книгу успішно видалено!</strong>";
    notification.style.width = "25%";
    notification.style.textAlign = "center";
    notification.style.padding = padding;
    notification.style.border = border;
    markup.append(notification);
  }, 1000);
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

function createForm() {
  const form = document.createElement("form");
  form.style.display = "flex";
  form.style.flexDirection = "column";
  form.style.gap = "30px";

  form.innerHTML = `
    <label>Title <input name="title"></label>
    <label>Author <input name="author"></label>
    <label>Year <input name="year"></label>
    <label>Description <textarea name="desc" rows="5" cols="40"></textarea></label>
    <button type="submit">Submit</button>
  `;

  return form;
}

function validateData(book) {
  if (
    Object.values(book).some(value => value === null || value.trim() === "")
  ) {
    alert("Поля не мають бути пустими!");
    return false;
  } else if (!Number.isInteger(Number(book.year))) {
    alert("Рік має бути числом");
    return false;
  } else {
    return true;
  }
}

function addDescription() {
  bookDescContainer.innerHTML = "";

  const title = document.createElement("h2");
  title.textContent = "Додати книгу";
  bookDescContainer.prepend(title);

  const form = createForm();

  form.addEventListener("submit", async e => {
    e.preventDefault();

    const data = new FormData(e.target);

    const book = {
      title: data.get("title"),
      author: data.get("author"),
      year: data.get("year"),
      description: data.get("desc"),
    };

    if (validateData(book)) {
      const submitButton = form.querySelector("button");
      submitButton.textContent = "Submiting...";

      try {
        await api.post("/books", book);
        showBookList();
        clearContainer(bookDescContainer);
      } catch (error) {
        console.log(error);
      } finally {
        submitButton.textContent = "Submit";
      }
    }
  });

  bookDescContainer.append(form);
}

async function editDescription(e) {
  bookDescContainer.innerHTML = "";
  bookDescContainer.style.border = border;
  bookDescContainer.style.padding = padding;

  const title = document.createElement("h2");
  title.textContent = "Редагувати книгу";
  bookDescContainer.prepend(title);

  const form = createForm();
  const id = e.target.parentNode.id;

  try {
    const { data } = await api(`/books/${id}`);
    form.elements.title.value = data.title;
    form.elements.author.value = data.author;
    form.elements.year.value = data.year;
    form.elements.desc.value = data.description;
  } catch (error) {
    console.log(error);
  }

  form.addEventListener("submit", async e => {
    e.preventDefault();

    const data = new FormData(e.target);

    const book = {
      title: data.get("title"),
      author: data.get("author"),
      year: data.get("year"),
      description: data.get("desc"),
    };

    if (validateData(book)) {
      const submitButton = form.querySelector("button");
      submitButton.textContent = "Submiting...";

      try {
        await api.put(`/books/${id}`, book);
        showBookList();
        clearContainer(bookDescContainer);
      } catch (error) {
        console.log(error);
      } finally {
        submitButton.textContent = "Submit";
      }
    }
  });
  bookDescContainer.append(form);
}

function handlePrevious() {
  clearContainer(bookDescContainer);
  pageCounter -= 1;
  showBookList();
}

function handleNext() {
  clearContainer(bookDescContainer);
  pageCounter += 1;
  showBookList();
}

function clearContainer(container) {
  container.innerHTML = "";
  container.style.border = "none";
}

function searchHandler(e) {
  e.preventDefault();
  search = e.target.elements.search.value.trim();
  pageCounter = 1;
  showBookList();
  e.target.reset();
  clearContainer(bookDescContainer);
}

function changeOrder(e) {
  sortOrder = e.target.value;
  pageCounter = 1;
  showBookList();
}

addBookBtn.addEventListener("click", addDescription);
showBookList();

searchForm.addEventListener("submit", searchHandler);

sortSelect.addEventListener("change", changeOrder);
