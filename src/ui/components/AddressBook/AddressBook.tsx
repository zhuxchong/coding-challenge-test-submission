import React from "react";
import { useAppSelector } from "../../../core/store/hooks";
import { motion, AnimatePresence } from "framer-motion";
import Typography from "../Typography/Typography";

import useAddressBook from "../../hooks/useAddressBook";
import Address from "../Address/Address";
import Button from "../Button/Button";
import Card from "../Card/Card";
import $ from "./AddressBook.module.css";
import { selectAddress } from "../../../core/reducers/addressBookSlice";

const AddressBook = () => {
  const addresses = useAppSelector(selectAddress);
  const { removeAddress, loadSavedAddresses, loading } = useAddressBook();
  const addressBookTitle = `📓 Address book (${addresses.length})`;

  React.useEffect(() => {
    loadSavedAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className={$.addressBook}>
      <Typography variant="h2" theme="dark">{addressBookTitle}</Typography>
      {!loading && (
        <>
          {addresses.length === 0 && <Typography variant="body" theme="dark">No addresses found, try add one 😉</Typography>}
          <AnimatePresence>
            {addresses.map((address, index) => {
              return (
                <motion.div
                  key={address.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  layout
                >
                  <Card>
                    <div data-testid={`address-${index}`} className={$.item}>
                      <div>
                        <Typography variant="h3" theme="light">
                          {address.firstName} {address.lastName}
                        </Typography>
                        <Address {...address} />
                      </div>
                      <div className={$.remove}>
                        <Button
                          variant="secondary"
                          onClick={() => removeAddress(address.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </>
      )}
    </section>
  );
};

export default AddressBook;
