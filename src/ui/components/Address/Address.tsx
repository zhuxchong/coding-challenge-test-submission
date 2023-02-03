import React, { FunctionComponent } from 'react';

import $ from './Address.module.css';

export interface AddressProps {
  street: string;
  houseNumber: string;
  postcode: string;
  city: string;
}

const Address: FunctionComponent<AddressProps> = (address) => {
  return (
    <address className={$.address}>
      {address.street} {address.houseNumber}, {address.postcode}, {address.city}
    </address>
  );
};

export default Address;
