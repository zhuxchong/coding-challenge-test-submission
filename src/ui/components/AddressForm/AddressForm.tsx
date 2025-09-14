import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

import Address from "@/components/Address/Address";
import Button from "@/components/Button/Button";
import InputText from "@/components/InputText/InputText";
import Radio from "@/components/Radio/Radio";
import Section from "@/components/Section/Section";
import Typography from "@/components/Typography/Typography";
import StructuredForm from "@/components/Form/StructuredForm";
import Field from "@/components/Form/Field";
import ErrorMessage from "@/components/ErrorMessage/ErrorMessage";
import useAddressBook from "@/hooks/useAddressBook";
import useForm from "@/hooks/useForm";
import apiService, { ApiError } from "@/services/api";
import transformAddress from "@/core/models/address";

import { Address as AddressType } from "../../../types";

function AddressForm() {
  const addressForm = useForm({
    postCode: "",
    houseNumber: "",
  });
  const personalForm = useForm({
    firstName: "",
    lastName: "",
  });
  /**
   * Results states
   */
  const [error, setError] = React.useState<undefined | string>(undefined);
  const [addresses, setAddresses] = React.useState<AddressType[]>([]);
  const [selectedAddress, setSelectedAddress] = React.useState<string>("");
  const [loading, setLoading] = React.useState({
    fetchAddresses: false,
    addToAddressBook: false,
    deleteAddress: false,
  });

  const updateLoading = (key: keyof typeof loading, value: boolean) => {
    setLoading((prev) => ({ ...prev, [key]: value }));
  };

  const handleOnResetAddress = () => {
    setAddresses([]);
    setSelectedAddress("");
  };

  /**
   * Redux actions
   */
  const { addAddress, existingAddresses } = useAddressBook();

  const handleAddressSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    handleOnResetAddress();
    updateLoading("fetchAddresses", true);

    try {
      const formValues = addressForm.getValues();
      const data = await apiService.get("/api/getAddresses", {
        postcode: formValues.postCode,
        streetnumber: formValues.houseNumber,
      });

      const transformedAddresses = (data || []).map((address: any) =>
        transformAddress({
          ...address,
          houseNumber: formValues.houseNumber,
        })
      );

      setAddresses(transformedAddresses);

      if (transformedAddresses.length === 0) {
        setError("No addresses found for the given postcode and house number");
      }
    } catch (err) {
      if (err instanceof ApiError) {
        // Set field-specific errors based on error code
        switch (err.code) {
          case 10001:
            addressForm.setFieldError(
              "postCode",
              "Postcode and street number fields mandatory!"
            );
            addressForm.setFieldError(
              "houseNumber",
              "Postcode and street number fields mandatory!"
            );
            setError(err.message);
            break;
          case 10002:
            addressForm.setFieldError("postCode", err.message);
            setError(err.message);
            break;
          case 10003:
            addressForm.setFieldError("postCode", err.message);
            setError(err.message);
            break;
          case 10004:
            addressForm.setFieldError("houseNumber", err.message);
            setError(err.message);
            break;
          default:
            setError(err.message);
        }
      } else {
        console.error("Error fetching addresses:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch addresses. Please try again."
        );
      }
    } finally {
      updateLoading("fetchAddresses", false);
    }
  };

  const handlePersonSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const foundAddress = addresses.find(
      (address) => address.id === selectedAddress
    );

    if (!foundAddress) {
      setError("Selected address not found");
      return;
    }

    const isExisting = (existingAddresses || []).find(
      (i) => i.id === selectedAddress
    );

    if (isExisting) {
      setError("Address is existing");
      return;
    }

    const personalValues = personalForm.getValues();
    addAddress({
      ...foundAddress,
      firstName: personalValues.firstName,
      lastName: personalValues.lastName,
    });

    toast.success(
      `Address for ${personalValues.firstName} ${personalValues.lastName} added successfully!`
    );
  };

  return (
    <Section>
      <StructuredForm
        onValuesChange={(changedValues, allValues) => {
          setError("");
        }}
        form={addressForm}
        name="addressForm"
        onSubmit={handleAddressSubmit}
        title="Create your own address book!"
        subtitle="Enter an address by postcode add personal info and done! 👏"
        legend="🏠 Find an address"
        submitText="Find"
        submitLoading={loading.fetchAddresses}
      >
        <Field
          name="postCode"
          label="Post Code"
          rules={[
            { required: true, message: "Postcode is required" },
            { min: 4, message: "Postcode must be at least 4 digits!" },
            {
              pattern: /^\d+$/,
              message: "Postcode must be all digits and non negative!",
            },
          ]}
        >
          {({ value, onChange, error, id }) => (
            <InputText
              name="postCode"
              placeholder="Post Code"
              value={value}
              onChange={onChange}
              id={id}
            />
          )}
        </Field>
        <Field
          name="houseNumber"
          label="House Number"
          rules={[
            { required: true, message: "House number is required" },
            {
              pattern: /^\d+$/,
              message: "Street Number must be all digits and non negative!",
            },
          ]}
        >
          {({ value, onChange, error, id }) => {
            return (
              <InputText
                name="houseNumber"
                placeholder="House number"
                value={value}
                onChange={onChange}
                id={id}
              />
            );
          }}
        </Field>
      </StructuredForm>
      <AnimatePresence mode="wait">
        {loading.fetchAddresses ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ padding: "20px", textAlign: "center" }}
          >
            <Typography variant="body" theme="light">
              Loading addresses...
            </Typography>
          </motion.div>
        ) : (
          addresses.length > 0 && (
            <motion.div
              key="addresses"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {addresses.map((address, index) => (
                <motion.div
                  key={address.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                  <Radio
                    name="selectedAddress"
                    id={address.id}
                    checked={selectedAddress === address.id}
                    onChange={(e) => {
                      setSelectedAddress(e.target.value);
                      setError("");
                    }}
                  >
                    <Address {...address} />
                  </Radio>
                </motion.div>
              ))}
            </motion.div>
          )
        )}
      </AnimatePresence>
      {/* TODO: Create generic <Form /> component to display form rows, legend and a submit button  */}
      {selectedAddress && (
        <StructuredForm
          onValuesChange={(changedValues, allValues) => {
            setError("");
          }}
          form={personalForm}
          name="personalForm"
          onSubmit={handlePersonSubmit}
          legend="✏️ Add personal info to address"
          submitText="Add to addressbook"
          submitLoading={loading.addToAddressBook}
        >
          <Field
            name="firstName"
            label="First Name"
            rules={{ required: true, message: "First name is required" }}
          >
            {({ value, onChange, error, id }) => (
              <InputText
                name="firstName"
                placeholder="First name"
                value={value}
                onChange={onChange}
                id={id}
              />
            )}
          </Field>
          <Field
            name="lastName"
            label="Last Name"
            rules={{ required: true, message: "Last name is required" }}
          >
            {({ value, onChange, error, id }) => (
              <InputText
                name="lastName"
                placeholder="Last name"
                value={value}
                onChange={onChange}
                id={id}
              />
            )}
          </Field>
        </StructuredForm>
      )}

      <Button
        variant="secondary"
        onClick={() => {
          addressForm.clearForm();
          personalForm.clearForm();
          handleOnResetAddress();
          setError("");
        }}
      >
        Clear all fields
      </Button>

      <ErrorMessage message={error} />
    </Section>
  );
}

export default AddressForm;
