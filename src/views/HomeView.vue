<template>
<section class="page container">
  <div class="hero-section tech-hero">
    <div class="hero-bg-devices">
      <div class="device-orb orb-phone">PHONE</div>
      <div class="device-orb orb-laptop">LAPTOP</div>
      <div class="device-orb orb-watch">WATCH</div>
      <div class="device-orb orb-headphones">HEADPHONES</div>
      <div class="device-orb orb-tablet">TABLET</div>
    </div>

    <div class="hero-content">
      <h1>Buy, Sell &amp; Swap Gadgets Easily</h1>
      <p>
        TechTrade is your online gadget marketplace to discover great deals
        from shops and private sellers.
      </p>

      <div class="hero-actions">
        <router-link to="/buy" class="btn">Start Buying</router-link>
        <router-link to="/sell" class="btn btn-outline-light">Post a Listing</router-link>
      </div>
    </div>
  </div>

  <section class="quick-actions">
    <h2>Quick Access</h2>
    <div class="action-grid">
      <router-link to="/buy" class="action-card">
        <h3>Buy</h3>
        <p>Browse gadgets from sellers and shops.</p>
      </router-link>

      <router-link to="/sell" class="action-card">
        <h3>Sell</h3>
        <p>Post your gadget listing in just a few steps.</p>
      </router-link>

      <router-link to="/my-listings" class="action-card">
        <h3>My Listings</h3>
        <p>Manage your active sale and swap items.</p>
      </router-link>

      <router-link to="/history" class="action-card">
        <h3>History</h3>
        <p>View purchased, sold, and swapped items.</p>
      </router-link>

      <router-link to="/dashboard" class="action-card">
        <h3>Dashboard</h3>
        <p>See account activity, messages, and profile info.</p>
      </router-link>
    </div>
  </section>

  <section class="categories-section">
    <h2>Popular Categories</h2>
    <div class="category-grid">
      <router-link
        v-for="category in categories"
        :key="category.name"
        :to="{ path: '/buy', query: { category: category.name } }"
        class="category-card"
      >
        <img :src="category.image" :alt="category.name" class="category-icon" />
        <h3>{{ category.name }}</h3>
      </router-link>
    </div>
  </section>
</section>
</template>

<script setup>
import phoneImg from '../assets/images/iphone.png'
import laptopImg from '../assets/images/laptop.png'
import headphonesImg from '../assets/images/headphones.png'
import smartwatchImg from '../assets/images/smartwatch.png'
import componentsImg from '../assets/images/components.png'
import appliancesImg from '../assets/images/appliances.png'

const categories = [
    { name: 'Phones', image: phoneImg },
    { name: 'Laptops', image: laptopImg },
    { name: 'Headphones', image: headphonesImg },
    { name: 'Smartwatches', image: smartwatchImg },
    { name: 'Components', image: componentsImg },
    { name: 'Home Appliances', image: appliancesImg },
]
</script>