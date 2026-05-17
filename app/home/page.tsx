import Link from 'next/link';

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Category from '@/components/Category';
import MostSearchedCar from '@/components/MostSearchedCar';
import SearchedParts from '@/components/SearchedParts';
//import MostSearchedCars from "@/components/MostSearchedCars";
//import ChargersAndAccessories from "@/components/ChargersAndAccessories";
//import RentalsAndLogistics from "@/components/RentalsAndLogistics";
//import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Navbar />

      <Hero />  

      <Category />

      <MostSearchedCar />

      <SearchedParts />
    </div>
  );
}