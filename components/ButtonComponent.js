"use client";

import React, { useState } from "react";
import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { Web3Provider } from "@ethersproject/providers";

const EAS_CONTRACT_ADDRESS = "0xC2679fBD37d54388Ce493F1DB75320D236e1815e";

const SCHEMA_UID_FEEDBACK =
  "0xf96cba05e00404771493fc70715f5afa43f784d8bd464954358f216fc014e090";
const SCHEMA_UID_NOT_USEFUL =
  "0x74e3a8fc864bea385b06b01eae46dc3252332350946fd1a454464b40e08c549f";

const ButtonComponent = () => {
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState("");
  const [formData, setFormData] = useState({
    id: "",
    buttonName: "",
    amount: "",
    notUseful: "",
  });
  const [attestationResult, setAttestationResult] = useState("");

  const handleButtonClick = (type) => {
    setFormType(type);
    setShowForm(true);
    setFormData({ id: "", buttonName: "", amount: "", notUseful: "" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const createAttestation = async () => {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });

      if (!window.ethereum) {
        throw new Error(
          "Ethereum provider is not available. Please install MetaMask."
        );
      }

      const provider = new Web3Provider(window.ethereum);
      console.log("Provider initialized:", provider);

      const signer = provider.getSigner();
      const senderAddress = await signer.getAddress();

      const eas = new EAS(EAS_CONTRACT_ADDRESS);
      eas.connect(signer);

      let schemaEncoder, encodedData, schemaUID;

      if (formType === "notUseful") {
        schemaEncoder = new SchemaEncoder("uint256 id, string notUseful");
        encodedData = schemaEncoder.encodeData([
          { name: "id", value: parseInt(formData.id), type: "uint256" },
          { name: "notUseful", value: formData.notUseful, type: "string" },
        ]);
        schemaUID = SCHEMA_UID_NOT_USEFUL;
      } else {
        schemaEncoder = new SchemaEncoder(
          "uint256 id, string buttonName, uint256 amount"
        );
        encodedData = schemaEncoder.encodeData([
          { name: "id", value: parseInt(formData.id), type: "uint256" },
          { name: "buttonName", value: formData.buttonName, type: "string" },
          {
            name: "amount",
            value: formData.amount ? parseInt(formData.amount) : 0,
            type: "uint256",
          },
        ]);
        schemaUID = SCHEMA_UID_FEEDBACK;
      }

      const tx = await eas.attest({
        schema: schemaUID,
        data: {
          recipient: senderAddress,
          expirationTime: 0,
          revocable: false,
          data: encodedData,
        },
        gasLimit: 500000,
      });

      const newAttestationUID = await tx.wait();

      setAttestationResult(
        `Attestation created successfully. UID: ${newAttestationUID}`
      );
    } catch (error) {
      console.error("Error creating attestation:", error);
      setAttestationResult(`Error creating attestation: ${error.message}`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    createAttestation();
    setShowForm(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="space-y-4 mb-8">
        <button
          onClick={() => handleButtonClick("positive")}
          className="px-6 py-2 text-black bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition duration-200"
        >
          Positive
        </button>
        <button
          onClick={() => handleButtonClick("negative")}
          className="px-6 py-2 text-black bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition duration-200"
        >
          Negative
        </button>
        <button
          onClick={() => handleButtonClick("notUseful")}
          className="px-6 py-2 text-black bg-yellow-500 rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 transition duration-200"
        >
          Not Useful
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow-md w-full max-w-md"
        >
          <div className="mb-4">
            <label htmlFor="id" className="block text-gray-700 font-bold mb-2">
              ID
            </label>
            <input
              type="text"
              id="id"
              name="id"
              value={formData.id}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              required
            />
          </div>

          {formType !== "notUseful" ? (
            <>
              <div className="mb-4">
                <label
                  htmlFor="buttonName"
                  className="block text-gray-700 font-bold mb-2"
                >
                  View
                </label>
                <input
                  type="text"
                  id="buttonName"
                  name="buttonName"
                  value={formData.buttonName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="amount"
                  className="block text-gray-700 font-bold mb-2"
                >
                  Amount
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  required
                />
              </div>
            </>
          ) : (
            <div className="mb-4">
              <label
                htmlFor="notUseful"
                className="block text-gray-700 font-bold mb-2"
              >
                View
              </label>
              <input
                type="text"
                id="notUseful"
                name="notUseful"
                value={formData.notUseful}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                required
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-500 text-black py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200"
          >
            Submit and Create Attestation
          </button>
        </form>
      )}
      {attestationResult && (
        <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-md">
          {attestationResult}
        </div>
      )}
    </div>
  );
};

export default ButtonComponent;
