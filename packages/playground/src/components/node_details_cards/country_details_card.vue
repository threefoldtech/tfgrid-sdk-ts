<template>
  <location-details :node="node" />
  <card-details :loading="loading" :items="countryFields" />
</template>

<script lang="ts">
import type { GridNode } from "@threefold/gridproxy_client";
import { onMounted, type PropType, ref } from "vue";

import type { NodeDetailsCard } from "@/types";
import { getCountryCode } from "@/utils/get_nodes";

import CardDetails from "./card_details.vue";
import locationDetails from "./location_details_card.vue";
export default {
  name: "CountryDetailsCard",
  components: { CardDetails, locationDetails },
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
      const x = getCountryFlagSrc();
      console.log("x ", x);
      return [
        { name: "Flag", imgSrc: getCountryFlagSrc(), hint: props.node.location.country },
        { name: "Name", value: props.node.country },
        { name: "Code ISO 2", value: getCountryCode(props.node) },
        { name: "City", value: props.node.city },
        { name: "Latitude", value: props.node.location.latitude?.toString() },
        { name: "Longitude", value: props.node.location.longitude?.toString() },
      ];
    };

    const getCountryFlagSrc = () => {
      const conuntryCode = getCountryCode(props.node);

      if (conuntryCode.length > 2) {
        return "";
      }
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
