# Security Policy for BlockTix (NFT-Tickets)

We take the security of the BlockTix platform seriously. We appreciate your efforts to responsibly disclose your findings, and we will make every effort to address all reproducible issues.

## Supported Versions

The BlockTix platform consists of frontend components and on-chain smart contracts. Support is generally provided for the latest versions and deployments.

| Component                          | Version/Identifier                                                                                                | Supported          |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------ |
| **Frontend UI (BlockTix DApp)**    | Latest commit on the `main` branch of the `Ryfitz11/NFT-Tickets` repository.                                      | :white_check_mark: |
|                                    | Older commits/versions                                                                                            | :x:                |
| **Smart Contracts (Base Sepolia)** |                                                                                                                   |                    |
| `EventTicketFactory.sol`           | Deployed Address: `0x26e99cf1490bD1468874A04bB1d363E19429D2cB`                                                    | :white_check_mark: |
| `EventTicket.sol` instances        | Contracts deployed by the above `EventTicketFactory` address.                                                     | :white_check_mark: |
| `USDC` (or `MockUSDC.sol`)         | Address specified in the project's current `.env` configuration for Base Sepolia.                                 | :white_check_mark: |
| other contract deployments         | Deployed Address: `0x5b77166e711cAB78763eB322d099216BC846F423`                                                    | :x:                |
| other contract deployments         | Deployed Address: `0x5b77166e711cAB78763eB322d099216BC846F423`                                                    | :x:                |
| **Backend Service (for Pinata)**   | The latest deployed version of the backend service responsible for IPFS uploads (if applicable and source-managed)| :white_check_mark: |


*As the project is under active development, specific version numbers for the frontend might not be formally released yet. Please refer to the `main` branch for the most up-to-date, supported code.*
*For smart contracts, support is tied to the currently active deployed addresses. If contracts are upgraded or redeployed, this policy will be updated.*

## Reporting a Vulnerability

We encourage responsible disclosure of security vulnerabilities. Please **do not** report security vulnerabilities through public GitHub issues.

Instead, please report vulnerabilities to:

**[security.ryfitz11.nfttickets@email.com]** (Please replace this with a dedicated email address you will monitor, e.g., a personal email or a new one set up for this purpose).

### What to Include in Your Report:
To help us address the issue quickly, please include the following in your report:
* A clear description of the vulnerability.
* The component affected (e.g., Frontend UI, `EventTicketFactory.sol` smart contract, `EventTicket.sol` smart contract, Backend API for Pinata).
* Steps to reproduce the vulnerability, including any specific inputs, configurations, or scenarios.
* The potential impact of the vulnerability.
* Any proof-of-concept code or screenshots, if applicable.
* Your name or alias for acknowledgment (optional).

### Our Commitment:
* We will acknowledge receipt of your vulnerability report within **3 business days**.
* We will investigate the reported vulnerability and aim to provide an initial assessment (e.g., whether it's accepted or declined, and initial thoughts on severity) within **7-10 business days** of acknowledgment.
* We will strive to keep you informed of the progress of our investigation and any remediation efforts. The frequency of updates will depend on the complexity and severity of the issue.
* We will publicly acknowledge your contribution (if you wish) once the vulnerability has been addressed, unless you prefer to remain anonymous.

### Scope:
Vulnerabilities in the following areas are of particular interest:
* Smart contract flaws (e.g., reentrancy, logic errors, gas optimization issues leading to exploits, incorrect fund handling).
* Frontend security issues (e.g., XSS, CSRF, issues related to wallet interactions, incorrect display of critical information).
* Backend API vulnerabilities (e.g., related to the Pinata image upload proxy – authentication, authorization, data exposure, insecure handling of API keys if the backend were compromised).
* Vulnerabilities that could lead to loss of funds, unauthorized ticket minting, or manipulation of event data.

### Out of Scope:
* Findings from scanners or automated tools that have not been manually validated.
* "Self" XSS or other issues that require a high degree of user interaction or social engineering, unless they have a significant impact.
* Denial of Service (DoS) attacks unless they can be performed with minimal resources.
* Issues related to outdated browsers or third-party browser extensions.
* Social engineering attacks.

We appreciate your help in keeping BlockTix secure!
