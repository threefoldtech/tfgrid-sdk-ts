<template>
  <card-details :loading="loading" title="Country Detials" :items="countryFields" icon="mdi-map-outline" />
</template>

<script lang="ts">
import type { GridNode } from "@threefold/gridproxy_client";
import { byCountry } from "country-code-lookup";
import { onMounted, type PropType, ref } from "vue";

import type { NodeDetailsCard } from "@/explorer/utils/types";

import CardDetails from "./card_details.vue";

export default {
  name: "CountryDetailsCard",
  components: { CardDetails },
  props: {
    node: {
      type: Object as PropType<GridNode>,
      required: true,
    },
  },

  setup(props) {
    const loading = ref<boolean>(false);
    const countryFields = ref<NodeDetailsCard[]>();

    const mount = () => {
      loading.value = true;
      countryFields.value = getNodeDetailsCard();
      loading.value = false;
    };

    onMounted(mount);

    const getNodeDetailsCard = (): NodeDetailsCard[] => {
      return [
        { name: "Flag", imgSrc: getCountryFlagSrc(), hint: props.node.location.country },
        { name: "Name", value: props.node.country },
        { name: "Code ISO 2", value: getCountryCode() },
        { name: "City", value: props.node.city },
        { name: "Latitude", value: props.node.location.latitude?.toString() },
        { name: "Longitude", value: props.node.location.longitude?.toString() },
      ];
    };

    const getCountryCode = (): string => {
      if (props.node.country && props.node.country.length > 2) {
        return byCountry(props.node.country)?.internet || props.node.country;
      }
      return props.node.country;
    };

    const getCountryFlagSrc = () => {
      const conuntryCode = getCountryCode();

      return conuntryCode.toLocaleLowerCase() != "ch"
        ? `https://www.worldatlas.com/r/w425/img/flag/${conuntryCode?.toLocaleLowerCase()}-flag.jpg`
        : `https://www.worldatlas.com/r/w425/img/flag/${conuntryCode?.toLocaleLowerCase()}-flag.png`;
    };

    return {
      countryFields,
      loading,
    };
  },
};
</script>
