/**
 * Задание 12 - Создать интерфейс StarWars DB для данных из SWAPI.
 *
 * Используя SWAPI, вывести информацию по всех планетам с пагинацией и возможностью просмотреть доп.
 * информацию в модальном окне с дозагрузкой смежных ресурсов из каждой сущности.
 *
 * Данные для отображения в карточке планеты:
 * 1. Наименование (name)
 * 2. Диаметр (diameter)
 * 3. Население (population)
 * 4. Уровень гравитации (gravity)
 * 5. Природные зоны (terrain)
 * 6. Климатические зоны (climate)
 *
 * При клике по карточке отображаем в модальном окне всю информацию
 * из карточки, а также дополнительную:
 * 1. Список фильмов (films)
 * - Номер эпизода (episode_id)
 * - Название (title)
 * - Дата выхода (release_date)
 * 2. Список персонажей (residents)
 * - Имя (name)
 * - Пол (gender)
 * - День рождения (birth_year)
 * - Наименование родного мира (homeworld -> name)
 *
 * Доп. требования к интерфейсу:
 * 1. Выводим 10 карточек на 1 странице
 * 2. Пагинация позволяет переключаться между страницами, выводить общее количество страниц и текущие выбранные
 * элементы в формате 1-10/60 для 1 страницы или 11-20/60 для второй и т.д.
 * 3. Используем Bootstrap для создания интерфейсов.
 * 4. Добавить кнопку "Показать все" - по клику загрузит все страницы с планетами и выведет
 * информацию о них в един (опцианально)
 */
// ======= доделать
/**
 * Наименование родного мира (homeworld -> name)
 * Добавить кнопку "Показать все" - по клику загрузит все страницы с планетами и выведет
 * информацию о них в един (опцианально)
 * Previous/Next
 * Выделить текущую страницу
 */
let currentPage;
let current;
const PAGE_SIZE = 10;

async function getPlanets(page = 1) {
  if (page === "Previous" && currentPage) {
    if (current > 1) {
        current--
    }
    url = currentPage.previous;
  } else if (page === "Next" && currentPage) {
    if (current < Math.round(currentPage.total / PAGE_SIZE)) {
        current++
    }
    url = currentPage.next;
  } else {
    current = page
    url = `https://swapi.dev/api/planets/?page=${page}`;
  }
  return await fetch(url)
    .then((res) => res.json())
    .then((res) => {
      const planets = {
        total: res.count,
        entities: res.results,
        next: res.next,
        previous: res.previous,
      };
      currentPage = planets;
      return planets;
    })
}


async function getAllPlanets() {
    let allPlanets = []
    for (num of Array(Math.round(60 / PAGE_SIZE)).keys()) {
        console.log(num);
         await fetch(`https://swapi.dev/api/planets/?page=${num+1}`).then(async (res) => {allPlanets.push(...(await res.json()).results)})
    }
    console.log(allPlanets, Array(Math.round(60 / PAGE_SIZE)).keys());
    return allPlanets;
}

function getPlanet(url) {
  return fetch(url).then((res) => res.json());
}

async function getDataForModal(planetUrl) {
  const planet = await getPlanet(planetUrl);

  // получить фильмы (films)
  const filmsPromise = planet.films.map((filmsUrl) =>
    fetch(filmsUrl).then((res) => res.json())
  );

  const films = await Promise.all(filmsPromise);

  // получить персонажей (residents)
  const residentsPromise = planet.residents.map((residentUrl) =>
    fetch(residentUrl).then((res) => res.json())
  );
  const residents = await Promise.all(residentsPromise);
  for (res of residents) {
    res.homeworld = (await fetch(res.homeworld).then((res) => res.json())).name;
  }

  // вернуть {films, residents}
  return { films, residents };
}

(async () => {
  const planets = await getPlanets();
  renderPage(planets.entities);
  renderPaginator(planets.total, PAGE_SIZE);
  managePage();
  showAll();
  manageModal();
})();

// * 1. Наименование (name)
// * 2. Диаметр (diameter)
// * 3. Население (population)
// * 4. Уровень гравитации (gravity)
// * 5. Природные зоны (terrain)
// * 6. Климатические зоны (climate)

function renderCard(planetInfo) {
  const items = ["diameter", "population", "gravity", "terrain", "climate"]
    .map((key) => `<li>${key}: ${planetInfo[key]}</li>`)
    .join("");

  return `
    <div class="card">
    <div class="card-body">
    <h5 class="card-title">${planetInfo.name}</h5>
    <ul>${items}</ul>
    <button type="button" data-link="${planetInfo.url}" class="btn btn-primary js-open-modal" data-bs-toggle="modal" data-bs-target="#exampleModal">
    More Information</button>
    </div>
    </div>
    `;
}

function renderPage(planets) {
  const cards = planets.map((planet) => renderCard(planet)).join("");
  document.querySelector(".js-cards").innerHTML = cards;
}

// <ul class="pagination">
//     <li class="page-item"><a class="page-link" href="#">Previous</a></li>
// <li class="page-item"><a class="page-link" href="#">1</a></li>
// <li class="page-item"><a class="page-link" href="#">2</a></li>
// <li class="page-item"><a class="page-link" href="#">3</a></li>
// <li class="page-item"><a class="page-link" href="#">Next</a></li>
// </ul>

function renderPaginator(total, pageSize) {
  const countPages = Math.round(total / pageSize);
  let items = "";
  for (let i = 0; i < countPages; i++) {
    if (current == i + 1) {
        items += `<li class="page-item active"><a class="page-link" href="#">${
            i + 1
          }</a></li>`;
    } else {
        items += `<li class="page-item"><a class="page-link" href="#">${
            i + 1
          }</a></li>`;
    }
  }

  const paginatorHtml = `
    <ul class="pagination">
    <li class="page-item"><a class="page-link" href="#">Previous</a></li>
    ${items}
    <li class="page-item"><a class="page-link" href="#">Next</a></li>
    </ul>
    `;

  document.querySelector(".js-pagination").innerHTML = paginatorHtml;
}

function managePage() {
  document
    .querySelector(".js-pagination")
    .addEventListener("click", async (event) => {
      if (!event.target.classList.contains("page-link")) {
        return;
      }
      // переключаемся на стр
      const pageNumber = event.target.textContent;
      const planets = await getPlanets(pageNumber);
      renderPage(planets.entities);
      renderPaginator(currentPage.total, PAGE_SIZE, current)
    });
}

function showAll() {
    document
      .getElementById("show-all")
      .addEventListener("click", async (event) => {
        const planets = await getAllPlanets()
        renderPage(planets)
        // if (!event.target.classList.contains("page-link")) {
        //   return;
        // }
        // // переключаемся на стр
        // const pageNumber = event.target.textContent;
        // const planets = await getPlanets(pageNumber);
        // renderPage(planets.entities);
        // renderPaginator(currentPage.total, PAGE_SIZE, current)
      });
  }

// * 1. Список фильмов (films)
// * - Номер эпизода (episode_id)
// * - Название (title)
// * - Дата выхода (release_date)
// * 2. Список персонажей (residents)
// * - Имя (name)
// * - Пол (gender)
// * - День рождения (birth_year)
// * - Наименование родного мира (homeworld -> name)
function manageModal() {
  document
    .querySelector(".js-cards")
    .addEventListener("click", async (event) => {
      if (!event.target.classList.contains("js-open-modal")) {
        return;
      }

      const url = event.target.getAttribute("data-link");

      // индикатор загрузки
      document.querySelector(
        ".js-modal-body"
      ).innerHTML = `    <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>`;

      const { films, residents } = await getDataForModal(url);

      const filmsList = films
        .map((film) =>
          [
            { key: "episode_id", label: "Номер эпизода" },
            { key: "title", label: "Название" },
            { key: "release_date", label: "Дата выхода" },
          ]
            .map(({ key, label }) => `<li>${label}: ${film[key]}</li>`)
            .join("")
        )
        .join("");

      const residentsList = residents
        .map((resident) =>
          ["name", "gender", "birth_year", "homeworld"]
            .map((key) => {
                let li = `<li>${key}: ${resident[key]}</li>`
                if (key == "homeworld") {
                    li += "<hr>"
                }
                return li
            })
            .join("")
        )
        .join("");

      document.querySelector(".js-modal-body").innerHTML = `
        <h4>Фильмы<h4>
        <ul>${filmsList}</ul>
         <h4>Персонажи<h4>
        <ul>${residentsList}</ul>
        `;
    });
}
