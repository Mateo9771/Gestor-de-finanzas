const tbody = document.getElementById("tbody");
const descItem = document.getElementById("desc");
const monto = document.getElementById("monto");
const tipo = document.getElementById("tipo");
const btnNew = document.getElementById("btnNew");
const inn = document.querySelector(".ingreso");
const exp = document.querySelector(".egreso");
const total = document.querySelector(".total");
const precioDolarDiv = document.querySelector(".divDolar #precioDolar");

let items ;

btnNew.onclick = () => {
    return descItem.value === "" || monto.value === "" || tipo.value === ""
      ? Swal.fire({
          icon: "error",
          title: "Incompleto",
          text: "Por favor, complete todos los campos",
        })
      : ((items.push({
          desc: descItem.value,
          monto: Math.abs(monto.value).toFixed(2),
          tipo: tipo.value,
          fecha: obtenerFechaActual(),
        }),
        setItensBD(),
        loadItem(),
        ordenarPorFecha(),
        (descItem.value = ""),
        (monto.value = "")),
        null);
  };

  function deleteItem(index) {
    items.splice(index, 1);
    setItensBD();
    loadItem();
  }

  function insertItem(item, index) {
    let tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${item.desc}</td>
      <td>${item.fecha}</td>
      <td>$ ${item.monto}</td>
      <td class="columnTipo">${
      item.tipo === "Entrada"
        ? '<i class="bx bxs-chevron-up-circle"></i>'
        : '<i class="bx bxs-chevron-down-circle"></i>'
      }</td>
      <td class="columnIcono">
        <button onclick="deleteItem(${index})"><i class='bx bx-trash'></i></button>
      </td>
    `;

    tbody.appendChild(tr);
  }

  function loadItem() {
    items = getItensBD();
    tbody.innerHTML = "";
    items.forEach((item, index) => {
      insertItem(item, index);
    });

    getTotals();
  }

  function getTotals() {
    const amountIncomes = items
      .filter((item) => item.tipo === "Entrada")
      .map((transaction) => Number(transaction.monto));

    const amountExpenses = items
      .filter((item) => item.tipo === "Salida")
      .map((transaction) => Number(transaction.monto));

    const totalInn = amountIncomes
      .reduce((acc, cur) => acc + cur, 0)
      .toFixed(2);

    const totalExp = Math.abs(
      amountExpenses.reduce((acc, cur) => acc + cur, 0)
    ).toFixed(2);

    const totalItems = (totalInn - totalExp).toFixed(2);

    inn.innerHTML = totalInn;
    exp.innerHTML = totalExp;
    total.innerHTML = totalItems;
  }

  const getItensBD = () => JSON.parse(localStorage.getItem("db_items")) ?? [];
  const setItensBD = () =>
  localStorage.setItem("db_items", JSON.stringify(items));

  function obtenerFechaActual() {
    const fecha = new Date();
    return `${fecha.toLocaleDateString()} ${fecha.toLocaleTimeString()}`;
  }

  function ordenarPorFecha() {
    items.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    loadItem();
  }

  async function obtenerPrecioDolar() {
    try {
      const response = await fetch('https://open.er-api.com/v6/latest/USD');
      const data = await response.json();
      const precioDolarARS = data.rates.ARS.toFixed(2);
      precioDolarDiv.innerHTML = `1 USD = ${precioDolarARS} ARS`;
    } catch (error) {
      console.error(`Error al obtener el precio del dólar: ${error.message}`);
      precioDolarDiv.innerHTML = 'Error al obtener el precio del dólar';
    }
  }

  obtenerPrecioDolar();
  loadItem(); 