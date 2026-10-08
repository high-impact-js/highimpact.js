---
aside: true
sidebar: true
layout: doc
---

<style>
  .aside-container {
    position: static !important;
    padding-top: 0 !important;
  }
  @media (max-width: 500px) {
    .ag-paging-page-size {
      display: none;
    }
  }
  @media (min-width: 1280px) {
    #myGrid {  
      width: 990px;
    }
  }
  
</style>
<script setup lang="ts">
import { ref, shallowRef } from 'vue';
import "./ag-grid-theme-builder-light.css";
import "./ag-grid-theme-builder-dark.css";
import { AgGridVue } from "ag-grid-vue3"; // Vue Data Grid Component
import { getCertifiedSites } from "./getCertifiedSites";

const gridApi = shallowRef();
// Row Data: The data to be displayed.
const rowData = ref([]);
// Get the certified sites from google sheet
getCertifiedSites(rowData);

 // Column Definitions: Defines the columns to be displayed.
 const colDefs = ref([
    { 
      field: "site", 
      headerName: "Site", 
      filter: true, 
      suppressSizeToFit: false,
      minWidth: 150,
      cellRenderer: (params) => {
        const hostName = new URL(params.data.siteUrl).hostname;
        return `<div class="grid grid-cols-[18px_1fr] items-center gap-3">
          <img src="https://icons.duckduckgo.com/ip3/${hostName}.ico" class="rounded-sm" />
          <a href="${params.data.siteUrl}?utm_source=get-advantage.org" target="blank">${params.data.site}</span></span>
        </div>`
      }
    },
    { field: "siteUrl", headerName: "Site URL", hide: true, },
    { field: "formatsMobile", headerName: "Formats Mobile", filter: true, },
    { field: "formatsDesktop", headerName: "Formats Desktop", filter: true, },
    { field: "publisherName", headerName: "Publisher", filter: true,  },
    {
        field: "country",
        headerName: "Country",
        headerClass: "header-product",
        filter: true,
        maxWidth: 120,
      },
    { field: "buyingType", headerName: "Buying Type", filter: true, hide: true, },
]);

const defaultColDef = {
  resizable: false,
};
const autoSizeStrategy = {
  type: "fitGridWidth",
  defaultMinWidth: 100,
};
const paginationPageSizeSelector = [5, 10, 20, 40, 60, 80, 100, 120];
const pagination = true;
const paginationPageSize = 40;

const onBtnExport = () => {
  gridApi.value.exportDataAsCsv({allColumns: true});
};
const onGridReady = (params) => {
  gridApi.value = params.api;
  window.addEventListener('resize', reszieColumns);
  reszieColumns()
};
function reszieColumns() {
  if (window.innerWidth > 1280) {
      gridApi.value.sizeColumnsToFit();
  } else {
      gridApi.value.autoSizeAllColumns();
  }
}
</script>

# Certified Implementations

Welcome to our showcase of certified webpages that have successfully integrated AdVantage, demonstrating the best practices in digital advertising. These websites have seamlessly adopted our platform's core components, ensuring a superior ad experience that aligns with their unique brand aesthetics.

Each of these sites has been thoroughly vetted to ensure they meet our stringent standards for performance, integration, and user experience. Explore the list below to see how leading publishers and advertisers are leveraging AdVantage to create engaging, impactful ad experiences.

 <!-- The AG Grid component -->
<div id="myGrid" class="ag-theme-custom" style="height: 100%">
  <ag-grid-vue
  :rowData="rowData"
  :columnDefs="colDefs"
  :defaultColDef="defaultColDef"
  :pagination="pagination"
  :paginationPageSizeSelector="paginationPageSizeSelector"
  :paginationPageSize="paginationPageSize"
  @grid-ready="onGridReady"
  style="height: 500px"></ag-grid-vue>
</div>
<div class="export-container flex justify-start" style="margin: 10px 0">
  <button v-on:click="onBtnExport()" class="primary font-bold py-2 px-4 rounded inline-flex items-center text-xs">
    <svg class="fill-current w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z"/></svg>
    <span>Download CSV export file</span>
  </button>
</div>

## Become a Certified AdVantage Partner

Interested in getting your site certified? Join our community of forward-thinking publishers and advertisers who are leading the way in digital advertising. Implement AdVantage on your site and submit a Github issue ticket with your integration for certification.

<button class="primary font-bold py-2 px-4 rounded inline-flex items-center text-xs" onclick="window.open('https://github.com/high-impact-js/highimpact.js/issues', '_blank')">Apply for Certification</button>

## Why Certification Matters

-   Verified Quality: Certification ensures that your site’s implementation of AdVantage is optimized for performance, user experience, and brand alignment.
-   Increased Trust: Being a certified AdVantage site signals to advertisers and users alike that your site adheres to the highest standards in digital advertising.

We are proud to recognize these exemplary implementations and look forward to adding more innovative sites to our list. For any questions or assistance with your integration, please join our [Slack channel](https://join.slack.com/t/high-impact-js/shared_invite/zt-2gy6c4z4m-4~pIuwRfe8eqPM5H7iV9MQ)
