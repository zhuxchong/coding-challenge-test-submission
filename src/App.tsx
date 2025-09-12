import React from "react";
import { Toaster } from "react-hot-toast";

import AddressForm from "@/components/AddressForm/AddressForm";
import AddressBook from "@/components/AddressBook/AddressBook";
import Section from "@/components/Section/Section";

function App() {
  return (
    <main>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            style: {
              background: "#4caf50",
            },
          },
        }}
      />
      <AddressForm />

      <Section variant="dark">
        <AddressBook />
      </Section>
    </main>
  );
}

export default App;
