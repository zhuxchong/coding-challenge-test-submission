import {
  addAddress,
  removeAddress,
  selectAddress,
  updateAddresses
} from '@/components/AddressBook/addressBookSlice';
import { Address } from '@/types';
import React from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';

import transformAddress from '../../core/models/address';
import databaseService from '../../core/services/databaseService';

export default function useAddressBook() {
  const dispatch = useAppDispatch();
  const addresses = useAppSelector(selectAddress);
  const [loading, setLoading] = React.useState(true);

  const updateDatabase = React.useCallback(() => {
    databaseService.setItem('addresses', addresses);
  }, [addresses]);

  return {
    /** Add address to the redux store */
    addAddress: (address: Address) => {
      dispatch(addAddress(address));
      updateDatabase();
    },
    /** Remove address by ID from the redux store */
    removeAddress: (id: string) => {
      dispatch(removeAddress(id));
      updateDatabase();
    },
    /** Loads saved addresses from the indexedDB */
    loadSavedAddresses: async () => {
      const saved: Address[] | null = await databaseService.getItem('addresses');
      // No saved item found, exit this function
      if (!saved || !Array.isArray(saved)) {
        setLoading(false);
        return;
      }
      dispatch(updateAddresses(saved.map((address) => transformAddress(address))));
      setLoading(false);
    },
    loading
  };
}
