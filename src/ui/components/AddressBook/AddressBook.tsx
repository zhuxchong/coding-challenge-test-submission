import React from 'react';
import { useSelector } from 'react-redux';
import { useAppSelector } from '@/app/hooks';

import useAddressBook from '../../hooks/useAddressBook';
import Address from '../Address/Address';
import Button from '../Button/Button';
import Card from '../Card/Card';
import $ from './AddressBook.module.css';
import { selectAddress } from './addressBookSlice';

const AddressBook = () => {
  const addresses = useAppSelector(selectAddress);
  const { removeAddress, loadSavedAddresses, loading } = useAddressBook();

  React.useEffect(() => {
    loadSavedAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className={$.addressBook}>
      <h2>📓 Address book ({addresses.length})</h2>
      {!loading && (
        <>
          {addresses.length === 0 && <p>No addresses found, try add one 😉</p>}
          {addresses.map((address) => {
            return (
              <Card key={address.id}>
                <div className={$.item}>
                  <div>
                    <h3>
                      {address.firstName} {address.lastName}
                    </h3>
                    <Address {...address} />
                  </div>
                  <div className={$.remove}>
                    <Button variant="secondary" onClick={() => removeAddress(address.id)}>
                      Remove
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </>
      )}
    </section>
  );
};

export default AddressBook;
