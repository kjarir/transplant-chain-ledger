const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TransplantChainLedger", function () {
  let transplantLedger;
  let owner;
  let patient;
  let donor;
  let doctor;
  let admin;

  beforeEach(async function () {
    [owner, patient, donor, doctor, admin] = await ethers.getSigners();

    const TransplantChainLedger = await ethers.getContractFactory("TransplantChainLedger");
    transplantLedger = await TransplantChainLedger.deploy();
    await transplantLedger.deployed();
  });

  describe("User Registration", function () {
    it("Should allow user registration", async function () {
      await transplantLedger.connect(patient).registerUser(
        "John Doe",
        0, // PATIENT role
        "+1234567890",
        "123 Main St, City, State",
        Math.floor(Date.now() / 1000) - 86400 * 365 * 30, // 30 years ago
        "O+",
        "No significant medical history",
        "Jane Doe +1234567891"
      );

      const user = await transplantLedger.getUser(patient.address);
      expect(user.fullName).to.equal("John Doe");
      expect(user.role).to.equal(0); // PATIENT
      expect(user.physicalAddress).to.equal("123 Main St, City, State");
    });

    it("Should not allow duplicate user registration", async function () {
      await transplantLedger.connect(patient).registerUser(
        "John Doe",
        0, // PATIENT role
        "+1234567890",
        "123 Main St, City, State",
        Math.floor(Date.now() / 1000) - 86400 * 365 * 30,
        "O+",
        "No significant medical history",
        "Jane Doe +1234567891"
      );

      await expect(
        transplantLedger.connect(patient).registerUser(
          "John Doe Again",
          0,
          "+1234567890",
          "123 Main St, City, State",
          Math.floor(Date.now() / 1000) - 86400 * 365 * 30,
          "O+",
          "No significant medical history",
          "Jane Doe +1234567891"
        )
      ).to.be.revertedWith("User already registered");
    });
  });

  describe("Organ Request", function () {
    beforeEach(async function () {
      // Register a patient first
      await transplantLedger.connect(patient).registerUser(
        "John Doe",
        0, // PATIENT role
        "+1234567890",
        "123 Main St, City, State",
        Math.floor(Date.now() / 1000) - 86400 * 365 * 30,
        "O+",
        "No significant medical history",
        "Jane Doe +1234567891"
      );

      // Register a doctor
      await transplantLedger.connect(doctor).registerUser(
        "Dr. Smith",
        2, // DOCTOR role
        "+1234567890",
        "456 Hospital St, City, State",
        Math.floor(Date.now() / 1000) - 86400 * 365 * 40,
        "A+",
        "Cardiologist",
        "Hospital Admin +1234567891"
      );
    });

    it("Should allow patient to create organ request", async function () {
      await transplantLedger.connect(patient).createOrganRequest(
        1, // HEART
        4, // High urgency
        "Heart failure requiring transplant",
        "Patient requires immediate heart transplant"
      );

      const userRequests = await transplantLedger.getUserRequests(patient.address);
      expect(userRequests.length).to.equal(1);

      const request = await transplantLedger.getOrganRequest(1);
      expect(request.organType).to.equal(1); // HEART
      expect(request.urgencyLevel).to.equal(4);
      expect(request.status).to.equal(0); // PENDING
    });
  });

  describe("Organ Donation", function () {
    beforeEach(async function () {
      // Register a donor first
      await transplantLedger.connect(donor).registerUser(
        "Jane Smith",
        1, // DONOR role
        "+1234567890",
        "789 Donor St, City, State",
        Math.floor(Date.now() / 1000) - 86400 * 365 * 25,
        "O+",
        "Healthy donor",
        "Emergency contact +1234567891"
      );
    });

    it("Should allow donor to register organ donation", async function () {
      await transplantLedger.connect(donor).createOrganDonation(
        1 // HEART
      );

      const userDonations = await transplantLedger.getUserDonations(donor.address);
      expect(userDonations.length).to.equal(1);

      const donation = await transplantLedger.getOrganDonation(1);
      expect(donation.organType).to.equal(1); // HEART
      expect(donation.status).to.equal(0); // PENDING
    });
  });

  describe("Contract Statistics", function () {
    it("Should return correct initial statistics", async function () {
      const stats = await transplantLedger.getContractStats();
      expect(stats.totalUsers).to.equal(0);
      expect(stats.totalRequests).to.equal(0);
      expect(stats.totalDonations).to.equal(0);
      expect(stats.totalTransactions).to.equal(0);
      expect(stats.totalVerifications).to.equal(0);
    });
  });
});
