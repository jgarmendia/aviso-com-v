(function () {
  "use strict";
  console.log("app"); // ;( )

  let app = {
    estadoApp: 0, // 0 sin empezar a revisar, 1 revisando
    estadoBoton: 0, ///// 0 sin press, 1 press
    estadoMenu: 0, // borgor navegacion
  };

  /*****************************************************************************
   *
   * Event listeners
   *
   ****************************************************************************/

  // menu de navegacion
  const menuButton = document.getElementById("menuButton");
  menuButton.addEventListener("click", () => {
    if (app.estadoMenu === 0) {
      app.estadoMenu = 1;
    } else {
      app.estadoMenu = 0;
    }

    const icon_borgar = document.getElementById("icon_borgar");
    const icon_close = document.getElementById("icon_close");
    icon_borgar.classList.toggle("icon-contract");
    icon_close.classList.toggle("icon-contract");

    let expanded =
      (menuButton.getAttribute("aria-expanded") === "true") | false;
    menuButton.setAttribute("aria-expanded", !expanded);

    const mainNav = document.getElementById("main_nav");
    const transitionTime = 285 + 1; // igual que en css +1

    if (mainNav.hasAttribute("hidden")) {
      mainNav.toggleAttribute("hidden");
    }

    setTimeout(() => {
      mainNav.classList.toggle("nav-open");
    });

    setTimeout(() => {
      if (!mainNav.hasAttribute("hidden") && app.estadoMenu === 0) {
        mainNav.toggleAttribute("hidden");
      }
    }, transitionTime);
  });

  // boton de monitor

  // si no es una página para monitorear, no hace nada.
  try {
    document.getElementById("monitorButton").addEventListener("click", () => {
      app.iniciarMonitor();
    });
  } catch {
    console.log("no es página para monitoreo");
  }

  /*****************************************************************************
   *
   * Methods
   *
   ****************************************************************************/

  // inicia monitoreo
  app.iniciarMonitor = async () => {
    console.log("click");
    let statusSpan = document.getElementById("statusSpan");
    let linkText = document.getElementById("sitelink");

    buttonControl();

    if (app.estadoBoton === 1 && app.estadoApp === 0) {
      app.estadoApp = 1;

      //  await notifyStatus(content_main); // iniciar rapido
      timmer(300000); //300000

      app.estadoApp = 0;
    }

    if (app.estadoBoton === 0) {
      statusSpan.textContent = "Esperando monitorear.";
      linkText.hidden = true;
    }

    //upRobot(content_main);
    // getStatus(content_main);
    // notifyStatus(content_main);
  };

  // boton monitor
  let buttonControl = () => {
    let monitorButton = document.getElementById("monitorButton");
    let statusAppText = document.getElementById("statusAppText");
    let linkText = document.getElementById("sitelink");
    if (app.estadoBoton === 0) {
      statusSpan.textContent = "...";
      monitorButton.textContent = "Parar";
      monitorButton.classList.toggle("button-toggle");
      statusAppText.hidden = false;
      app.estadoBoton = 1;
    } else if (app.estadoBoton === 1) {
      monitorButton.textContent = "Iniciar";
      monitorButton.classList.toggle("button-toggle");
      statusAppText.hidden = true;
      linkText.hidden = true;
      app.estadoBoton = 0;
    }
  };

  // timmer
  const timmer = async (inter) => {
    console.log("timmer");
    if (app.estadoBoton === 1) {
      await notifyStatus(content_main);
    }
    let timeOut = setTimeout(() => {
      if (app.estadoBoton === 0) {
        console.log("clearInterval");
        clearInterval(timeOut);
      } else if (app.estadoBoton === 1) {
        console.log("timeout");
        timmer(inter);
      } else {
        return;
      }
    }, inter);
  };

  // uptime robot //

  // key publicas
  const apikey_main = "m784959795-283658004492d2d1be742be4";
  const apikey_priv = "PUBLIC_KEY_TEST";

  /*
  Una alternativa para seguir sin necesidad de un server, para nuestra API_KEY (si es que fuera privada)
   es usar una serverless function en Netlify, pero tiene un costo despues de una cantidad de usos.

  Otra es Vercel, tiene 100gb/h para serverless funtions
  */

  // content del body para fetch main
  const content_main = {
    api_key: apikey_main,
    response_times: 1,
    logs: 1,
    log_types: "1-2",
  };

  // content del body para fetch de keyword1
  const content_priv = {
    api_key: apikey_priv,
    response_times: 1,
    logs: 1,
    log_types: "1",
  };

  /**
   * fetch al robot con un bodyContent y retorna la data
   * @param  {Object} bodyContent - Contenido del body del Fetch
   * @return {Object}             - datos del fetch o null
   */
  let upRobot = async (bodyContent) => {
    try {
      let response = await fetch(`https://api.uptimerobot.com/v2/getMonitors`, {
        method: "POST",
        body: JSON.stringify(bodyContent),
        mode: "cors",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      let data = await response.json();
      console.log("upRobot: ");
      console.log(data); //dev
      return data;
    } catch (error) {
      console.log("upRobot error" + error);
      return null;
    }
  };

  /**
   * Obtiene el status
   * @param  {Object} bodyContent - Contenido del body del Fetch
   * @return {number}             - numero de status o null
   */
  let getStatus = async (bodyContent) => {
    let data = await upRobot(bodyContent);

    if (!data) {
      console.log("malooo");
      return null;
    }

    if (data.stat !== "ok") {
      console.log("Status: fail, problema uptimeRobot");
      return null;
    }

    /******
     * status:
     * 2 -> up
     * 9 -> down
     */

    let monitorStatus = data.monitors[0].status;

    return monitorStatus;
  };

  //
  //  notificar usando el status de getStatus
  let notifyStatus = async (bodyContent) => {
    let status = await getStatus(bodyContent);
    console.log("notify status : " + status); // dev

    let statusSpan = document.getElementById("statusSpan");
    let linkText = document.getElementById("sitelink");
    const vibrateMs = 200;

    /*
    if (status === null) {
      console.log("bodyContent null");
      return;
    }
    */

    if (status !== 2) {
      linkText.hidden = true;
    }

    // si se cancela entre medio
    if (app.estadoBoton === 0) {
      console.log("noti cancelada");
      return;
    }

    switch (status) {
      case 0:
        console.log("paused!");
        statusSpan.textContent = "Monitor en mantenimiento.";
        break;
      case 1:
        console.log("sin checkear!");
        statusSpan.textContent = "Monitor sin revisar.";
        break;
      case 2:
        console.log("esta up!");
        statusSpan.textContent = "Sitio disponible.";
        linkText.hidden = false;
        if ("vibrate" in navigator) {
          console.log("brrr");
          window.navigator.vibrate(vibrateMs);
        }
        break;
      case 8:
        console.log("parece que está down!");
        statusSpan.textContent = "Sitio parece no disponible.";
        break;
      case 9:
        console.log("esta down!");
        statusSpan.textContent = "Sitio no disponible.";
        break;
      default:
        console.log("error");
        statusSpan.textContent = "Error. Intente más tarde.";
        linkText.hidden = true;
        break;
    }
  };

  //
})();
