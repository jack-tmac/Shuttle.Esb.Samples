<template>
  <div>
    <div v-if="books.length">
      <h4>Available titles</h4>
      <table class="table table-sm">
        <thead class="thead-light">
          <tr class="row">
            <th class="col-1"></th>
            <th class="col">Title</th>
            <th class="col-2 text-right">Price</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="book in books"
            v-bind:key="book.description"
            class="row"
            v-bind:class="{ 'table-info' : book.buying }"
          >
            <td class="col-1">
              <button
                v-if="book.buying"
                v-on:click="toggle(book)"
                class="btn btn-default btn-danger btn-sm"
              >Remove</button>
              <button
                v-else
                v-on:click="toggle(book)"
                class="btn btn-default btn-success btn-sm"
              >Add</button>
            </td>
            <td class="col"><a :href="book.url" target="_blank">{{book.description}}</a></td>
            <td class="col-2 text-right">{{book.price}}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="row">
            <td colspan="2" class="col"></td>
            <td class="col-2 text-right info">{{total}}</td>
          </tr>
        </tfoot>
      </table>
      <div v-if="canOrder()">
        <h4>Checkout</h4>
        <label for="customerName">Name</label>
        <b-form-input v-model="customerName" placeholder="Enter your name" trim />
        <div class="text-warning" v-if="!$v.customerName.required">can't be blank</div>
        <label for="customerEMail">e-mail</label>
        <b-form-input
          v-model="customerEMail"
          type="email"
          placeholder="abc.xyz@example.com"
          class="mr-1"
        />
        <div class="text-warning" v-if="!$v.customerEMail.email">is not a valid e-mail</div>
        <div class="text-warning" v-if="!$v.customerEMail.required">can't be blank</div>
        <br />
        <b-button v-on:click="cancel" variant="secondary" class="mr-1">Cancel</b-button>
        <b-dropdown variant="primary" text="Order">
          <b-dropdown-item href="#" v-on:click="orderCustom">Custom</b-dropdown-item>
          <b-dropdown-item href="#" v-on:click="orderCustomEventSource">Custom / EventSource</b-dropdown-item>
          <b-dropdown-item href="#" v-on:click="orderEventSourceModule">EventSource / Module</b-dropdown-item>
        </b-dropdown>
      </div>
      <br />
    </div>
    <div v-else>
      <b-card>
        <h4 slot="header">(fetching books)</h4>
        <b-card-text>
          <b-progress :value="100" striped :animated="true" class="mt-2"></b-progress>
        </b-card-text>
      </b-card>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import configuration from "@/configuration.js";
import { required, email } from "vuelidate/lib/validators";
import state from "@/state.js";

export default {
  name: "shuttle-books",
  data() {
    return {
      customerName: "",
      customerEMail: "",
      books: []
    };
  },
  validations: {
    customerName: {
      required
    },
    customerEMail: {
      required,
      email
    }
  },
  computed: {
    total() {
      return this.books.reduce(function(result, item) {
        return result + (item.buying ? item.price : 0);
      }, 0);
    }
  },
  methods: {
    toggle(book) {
      book.buying = !book.buying;
    },
    canOrder() {
      return this.total > 0;
    },
    cancel() {
      this._clearOrder();
    },
    _clearOrder() {
      this.books.forEach(function(book) {
        book.buying = false;
      });
    },
    orderCustom() {
      this._submitOrder("custom");
    },
    orderCustomEventSource() {
      this._submitOrder("custom / event-source");
    },
    orderEventSourceModule() {
      this._submitOrder("event-source / module");
    },
    _submitOrder: function(targetSystem) {
      var self = this;

      if (this.$v.$invalid) {
        return false;
      }

      var order = {
        productIds: [],
        targetSystem: targetSystem,
        customerName: this.customerName,
        customerEMail: this.customerEMail
      };

      this.books.forEach(function(book) {
        if (book.buying) {
          order.productIds.push(book.id);
        }
      });

      axios
        .post(configuration.url + "/orders", order)
        .then(() => {
          self._clearOrder();

          state.alerts.add({
            message: "Your order has been sent for processing.",
            name: "order-placed"
          });
        })
        .catch(error => {
          state.alerts.add({
            message: error.message,
            name: "order-error",
            type: "danger"
          });
        });
    }
  },
  mounted() {
    axios.get(configuration.url + "/products").then(response => {
      this.books = response.data.data.map(function(book) {
        book.buying = false;
        return book;
      });
    });
  }
};
</script>
