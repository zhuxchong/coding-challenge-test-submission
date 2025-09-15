import type { NextApiRequest, NextApiResponse } from "next";

import generateMockAddresses from "../../src/utils/generateMockAddresses";

interface ErrorOptions {
  res: NextApiResponse;
  code: number;
  errormessage: string;
  statusCode?: number;
}

const sendError = ({
  res,
  code,
  errormessage,
  statusCode = 400,
}: ErrorOptions) => {
  return res.status(statusCode).send({
    status: "error",
    code,
    errormessage,
  });
};

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    query: { postcode, streetnumber },
  } = req;

  if (!postcode || !streetnumber) {
    return res.status(400).send({
      status: "error",
      code: 10001,
      // DO NOT MODIFY MSG - used for grading
      errormessage: "Postcode and street number fields mandatory!",
    });
  }

  if (postcode.length < 4) {
    return res.status(400).send({
      status: "error",
      code: 10002,
      // DO NOT MODIFY MSG - used for grading
      errormessage: "Postcode must be at least 4 digits!",
    });
  }

  /** TODO: Implement the validation logic to ensure input value
   *  is all digits and non negative
   */
  const isStrictlyNumeric = (value: string) => {
    const isAllDigits = /^\d+$/.test(value);
    const isNonNegative = !isNaN(Number(value)) && Number(value) >= 0;
    return isAllDigits && isNonNegative;
  };

  /** TODO: Refactor the code below so there is no duplication of logic for postCode/streetNumber digit checks. */
  if (!isStrictlyNumeric(postcode as string)) {
    return sendError({
      res,
      code: 10003,
      errormessage: "Postcode must be all digits and non negative!",
    });
  }

  if (!isStrictlyNumeric(streetnumber as string)) {
    return sendError({
      res,
      code: 10004,
      errormessage: "Street Number must be all digits and non negative!",
    });
  }

  const mockAddresses = generateMockAddresses(
    postcode as string,
    streetnumber as string
  );
  if (mockAddresses) {
    const timeout = (ms: number) => {
      return new Promise((resolve) => setTimeout(resolve, ms));
    };

    // delay the response by 500ms - for loading status check
    await timeout(500);
    return res.status(200).json({
      status: "ok",
      details: mockAddresses,
    });
  }

  return res.status(404).json({
    status: "error",
    // DO NOT MODIFY MSG - used for grading
    errormessage: "No results found!",
  });
}
