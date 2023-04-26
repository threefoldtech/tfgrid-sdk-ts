<script>
  import toTeraOrGiga from "../filters/toTeraOrGiga";
  import Card from "./Card.svelte";

  export let card;
  export let primaryTitle = true;
  export let secondaryTitle = true;
  export let primaryDetails = true;
  export let secondaryDetails = false;
  let data = card.data;

  if (card.title == "SSD Storage" || card.title == "HDD Storage" || card.title == "RAM") {
    data = toTeraOrGiga(data.toString());
  }
</script>

<Card>
  <div class="card">
    <div class="title" class:title-primary={primaryTitle} class:title-secondary={secondaryTitle}>
      <p>{card.title}</p>
    </div>
    <div class="card-details" class:details-secondary={secondaryDetails} class:details-primary={primaryDetails}>
      <div>
        <img src={card.icon} alt="" />
      </div>
      <div class="card-data">{data}</div>
    </div>
  </div>
</Card>

<style>
  p {
    margin: 0;
  }
  .card {
    display: grid;
    grid-template-rows: 0fr 1fr;
  }

  .card-details {
    display: grid;
    grid-template-columns: 1fr 3fr;
    text-align: end;
    align-content: center;
    padding: 0.5rem 1rem;
    color: #353434b6;
  }

  .card-data {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    font-size: 1.25rem;
  }
  .title {
    display: flex;
    align-items: center;
    justify-content: end;
    height: 2rem;
    color: #fff;
    font-weight: 500;
    text-align: end;
    padding: 0 1rem;
  }
  .title-primary {
    background-color: #1982b1;
  }

  .title-secondary {
    background-color: #4cbbd9;
  }

  .details-primary {
    background-color: #fff;
    height: 2rem;
  }

  .details-secondary {
    background-color: #ebe7e7;
  }
</style>
