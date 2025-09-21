import { NextResponse } from "next/server";

import { getUapiDomesticStockV1QuotationsInquirePrice } from "kis-typescript-sdk";

export const GET = async () => {
  try {
    const response = await getUapiDomesticStockV1QuotationsInquirePrice({
      FID_INPUT_ISCD: "005930",
      FID_COND_MRKT_DIV_CODE: "J",
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error(
      "Failed to fetch stock quotation:",
      JSON.stringify(error, null, 3),
    );
    return NextResponse.json(
      { error: "Failed to fetch stock quotation" },
      { status: 500 },
    );
  }
};
