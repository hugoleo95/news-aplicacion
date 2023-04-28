<template>
  <div class="mt-24" id="top">
    <div class="flex flex-col items-center max-w-screen-xl mx-auto px-4">
      <div class="w-3/5 flex pl-1">
        <div class="w-1/2 flex justify-start">
          <h2 class="text-left text-2xl font-semibold">Stetic News</h2>
        </div>
        <div class="w-1/2 flex justify-end">
          <ul
            class="xl:flex flex-wrap justify-between order-2 md:ml-0 lg:ml-auto"
          >
            <li
              class="justify-start lg:px-6 flex flex-row relative items-center"
            >
              <i
                class="fas fa-search justify-center items-center mr-2 dark:text-white"
              />
              <input
                class="mb-0 font-light bg-transparent focus:border-b-2 focus:outline-none placeholder-darkGrey dark:text-white dark:placeholder-white text-black"
                type="text"
                v-model="search"
                placeholder="Buscar..."
                @keyup="buscar"
              />
            </li>
          </ul>
        </div>
      </div>
      <div v-if="Loading" class="flex items-center h-64 my-1">
        <s-spinner />
      </div>
      <div v-if="!Loading" class="w-3/5 flex justify-center">
        <div
          v-if="Publicaciones.length > 0"
          class="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-y-8 lg:gap-y-0 gap-x-8 mb-8 lg:mb-20"
        >
          <div
            v-for="(publi, index) in Publicaciones"
            v-show="
              (pag_publi - 1) * NUM_RESULTS_PUBLICACIONES <= index &&
              pag_publi * NUM_RESULTS_PUBLICACIONES > index
            "
            :key="index"
            class="lex flex-col items-center relative rounded-3xl shadow-lg card card-max"
          >
            <div class="w-full flex flex-row border-b px-6 py-6">
              <div class="w-1/2">
                <h5 class="text-left text-lg font-semibold mb-0">
                  {{ FormateCategory(publi.cod_categoria) }}
                </h5>
              </div>
              <div class="w-1/2">
                <h5 class="text-right text-lg font-semibold mb-0">
                  {{ FormatePais(publi.cod_pais) }}
                </h5>
              </div>
            </div>
            <div class="w-full p-6">
              <p class="mb-6 text-lightBlack font-normal text-base text-left">
                {{ publi.texto }}
              </p>
            </div>
            <div class="w-full flex flex-row border-t px-6 py-6">
              <div class="w-1/2">
                <h5 class="text-left text-lg font-semibold mb-0">
                  {{ DateFormate(publi.created_at) }}
                </h5>
              </div>
              <div class="w-1/2">
                <h5
                  class="text-right text-lg font-semibold mb-0"
                  v-html="FormateEnlaces(publi.enlaces)"
                >
                  &nbsp;
                </h5>
              </div>
            </div>
          </div>
          <div v-if="Publicaciones.length > 0" class="text-right mt-2">
            <strong class="text-secondary"
              >&nbsp;&nbsp;{{ CountPagePublicacion }} of
              {{ Publicaciones.length }}</strong
            >
            <b-button
              variant="primary"
              aria-label="Previous"
              :class="[
                pag_publi != 1
                  ? 'opacity-100 cursor-pointer'
                  : 'opacity-25 pointer-events-none	',
              ]"
              class="py-1 px-1"
              @click.prevent="
                BackButton();
                scrollInto('top');
                Loading = true;
              "
            >
              <span aria-hidden="true">
                <i class="fas fa-arrow-left text-black" />
              </span>
            </b-button>
            <b-button
              variant="primary"
              aria-label="Next"
              :class="[
                (pag_publi * NUM_RESULTS_PUBLICACIONES) / Publicaciones.length <
                1
                  ? 'opacity-100 cursor-pointer'
                  : 'opacity-25 pointer-events-none	',
              ]"
              class="py-1 px-1"
              @click.prevent="
                GoButton();
                scrollInto('top');
                Loading = true;
              "
            >
              <span aria-hidden="true">
                <i class="fas fa-arrow-right text-black" />
              </span>
            </b-button>
          </div>
        </div>
        <div
          v-if="Publicaciones.length === 0"
          class="w-full flex justify-center mt-20"
        >
          <h2 class="text-left text-lg font-semibold">No results found</h2>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import _ from "lodash";
import simpleeAdmin from "~/components/services/simpleeAdmin.js";
import SSpinner from "~/components/Spinner.vue";
import moment from "moment";
export default {
  components: { SSpinner },
  data() {
    return {
      Publicaciones: {},
      Categorias: {},
      Paises: {},
      search: "",
      NUM_RESULTS_PUBLICACIONES: 3,
      pag_publi: 1,
      Loading: true,
    };
  },
  computed: {
    CountPagePublicacion() {
      if (
        this.Publicaciones?.length >
        this.NUM_RESULTS_PUBLICACIONES * this.pag_publi
      ) {
        return this.pag_publi * this.NUM_RESULTS_PUBLICACIONES;
      }
      return this.Publicaciones?.length || 0;
    },
  },
  created() {
    this.GetPaises();
    this.GetCategorias();
    //this.GetPublicaciones();
  },
  mounted() {
    this.SearchPublicacion();
  },
  methods: {
    SearchPublicacion: _.debounce(function (value) {
      this.GetPublicaciones(value);
    }, 2000),
    async GetPublicaciones(value) {
      this.pag_publi = 1;
      if (value) {
        try {
          const _response = await simpleeAdmin.get(
            `/publicaciones/?search=${value}`
          );
          this.Publicaciones = _response.data;
          this.Loading = false;
        } catch (error) {
          console.log(error);
        }
      } else {
        try {
          const _response = await simpleeAdmin.get("/publicaciones");
          this.Publicaciones = _response.data;
          this.Loading = false;
        } catch (error) {
          console.log(error);
        }
      }
    },
    async GetPaises() {
      try {
        const _response = await simpleeAdmin.get("/paises");
        this.Paises = _response.data;
      } catch (error) {
        console.log(error);
      }
    },
    async GetCategorias() {
      try {
        const _response = await simpleeAdmin.get("/categorias");
        this.Categorias = _response.data;
      } catch (error) {
        console.log(error);
      }
    },
    buscar(value) {
      this.Loading = true;
      this.SearchPublicacion(value.target._value);
    },
    hide() {
      //this.Loading = true;
      //this.SearchPublicacion(value.target._value);
    },
    BackButton: _.debounce(function () {
      this.BackButtonAct();
    }, 2000),
    BackButtonAct() {
      this.pag_publi -= 1;
      this.Loading = false;
    },
    GoButton: _.debounce(function () {
      this.GoButtonAct();
    }, 2000),
    GoButtonAct() {
      this.pag_publi += 1;
      this.Loading = false;
    },
    scrollInto(elemento) {
      const section = document.querySelector(`#${elemento}`);
      section.scrollIntoView({
        behavior: "smooth",
      });
    },
    DateFormate(date) {
      const createdAt = new Date(date).toLocaleString("en-GB");
      const [fecha, hour] = createdAt.split(",");
      const Datenew = moment();
      const DateOld = moment(date);
      const Days = Datenew.diff(DateOld, "days");
      let dias;
      if (Days === 0) {
        dias = "Hoy";
      } else if (Days === 1) {
        dias = "Ayer";
      } else if (Days > 0) {
        dias = "Hace " + Days + ` ${Days === 1 ? "Dia" : "Dias"}`;
      }
      return `${dias},\n${hour}`;
    },
    FormateEnlaces(value) {
      let arr = value.split(",");
      if (arr.length > 1) {
        let valuearray;
        for (let i = 0; i < arr.length; i++) {
          if (i === 0) {
            valuearray =
              "<a target='_blank' href='https://" +
              arr[i] +
              "'>" +
              arr[i] +
              "</a>";
          } else {
            valuearray =
              valuearray +
              " and <a target='_blank' href='https://" +
              arr[i] +
              "'>" +
              arr[i] +
              "</a>";
          }
        }
        return "Leer más en " + valuearray;
        //return '<a href="#">#$1</a>';
      } else {
        return (
          "Leer más en <a target='_blank' href='https://" +
          value +
          "'>" +
          value +
          "</a>"
        );
      }
    },
    FormateCategory(value) {
      const ResultCategoria = this.Categorias.find(({ id }) => value === id);
      return ResultCategoria.nombre;
    },
    FormatePais(value) {
      if (value) {
        const ResultPais = this.Paises.find(({ id }) => value === id);
        return ResultPais.nombre;
      } else {
        return "";
      }
    },
  },
};
</script>

<style lang="scss" scoped>
/* .card {
  .hidden-list {
    animation: expanded-card 0.3s ease forwards;

    li {
      animation: fadein 0.3s ease forwards;
    }
  }
} */
.card-min {
  max-height: 38rem;

  @media (min-width: 1024px) and (max-width: 1260px) {
    max-height: 43rem;
  }
}
.card-max {
  max-height: unset;
}

@keyframes expanded-card {
  0% {
    height: 0;
  }
  100% {
    height: max-content;
  }
}
@keyframes fadein {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>