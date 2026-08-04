import { siteConfig } from "@/lib/env";
import { Container } from "@/sections/profile/legal/Container.tsx";
import { TFunction } from "@/lib/i18n/i18next";
import { useTranslation } from "@/lib/i18n/react-i18next";

const gameLink = `<a target="_blank" href="${siteConfig.url}" class="text-primary font-bold">${siteConfig.nickname}</a>`;

const content = (t: TFunction) => [
  {
    id: "Introduction",
    text: {
      title: t("termOfService:introduction.title"),
      content: t("termOfService:introduction.content", {
        gameLink: gameLink,
      }),
      //   open: false,
      // content: `
      //   <p class="leading-7">
      //       These terms and conditions and the documents referred to below (the "<span class="text-base font-bold">Terms</span>") apply to the use of the current website (the "<span class="text-base font-bold">Website</span>") and its related or connected services (collectively, the "<span class="text-base font-bold">Service</span>"). You should carefully review these Terms as they contain important information concerning your rights and obligations regarding the use of the Website and form a binding legal agreement between you - our customer (the "<span class="text-base font-bold">Customer</span>"), and us (the "<span class="text-base font-bold">Website</span>"). By using this Website and/or accessing the Service, you, whether you are a guest or a registered user with an account ("<span class="text-base font-bold">Account</span>"), agree to be bound by these Terms, together with any amendments, which may be published from time to time. If you do not accept these Terms, you should refrain from accessing the Service and using the Website.
      //   </p>
      //   <br />
      //   <p class="leading-7">
      //       The {{gameLink}} Alliance is owned by <span class="text-base font-bold">Omnispect B.V.</span>, a limited liability company registered in Curacao with company registration number <span class="text-base font-bold">165406</span>, with a registered address at <span class="text-base font-bold">Abraham de Veerstraat 9, Willemstad ("Company")</span> for the provision of online games of chance.
      //   </p>
      //   `,
    },
  },
  {
    id: "generalTerms",
    text: {
      title: t("termOfService:generalTerms.title"),
      content: t("termOfService:generalTerms.content"),
      open: false,
      //   content: `
      //       <p class="leading-7">
      //         We reserve the right to revise and amend the Terms (including any documents referred to and linked below) at any time. You should visit this page periodically to review the Terms and Conditions. Amendments will be binding and effective immediately upon publication on this Website. If you object to any such changes, you must immediately stop using the Service. Your continued use of the Website following such publication will indicate your agreement to be bound by the Terms as amended. Any bets not settled prior to the changed Terms taking effect will be subject to the pre-existing Terms.          </p>
      //       <br />
      //     `,
    },
  },
  {
    id: "yourObligations",
    text: {
      title: t("termOfService:yourObligations.title"),
      content: t("termOfService:yourObligations.content", {
        age: 18,
        gameLink: gameLink,
      }),
      open: false,
      //   content: `
      //         <p class="leading-7">
      //             You acknowledge that at all times when accessing the Website and using the Service:
      //         </p>
      //         <p class="leading-7">
      //             3.1. You are over {{age}}, or of the legal age at which gambling or gaming activities are allowed under the law or jurisdiction that applies to you. We reserve the right to request proof of age documents from you at any time.
      //         </p>
      //         <p class="leading-7">
      //             3.2. You are of legal capacity and can enter into a binding legal agreement with us. You must not access the Website or utilize the Service if you are not of legal capacity.
      //         </p>
      //         <p class="leading-7">
      //             3.3.  You are aware that the right to access and use the Website and any products there offered, may be considered illegal in certain countries. We are not able to verify the legality of service in each and every jurisdiction, consequently, you are responsible in determining whether your accessing and using our website is compliant with the applicable laws in your country and you warrant to us that gambling is not illegal in the territory where you reside. By using the Website you confirm you are not a resident in a Restricted Jurisdiction.
      //         </p>
      //         <p class="leading-7">
      //             3.4. When attempting to open an account or using the Website, it is the responsibility of the player to verify whether gambling is legal in that particular jurisdiction.
      //         </p>
      //         <p class="leading-7">
      //             3.5. You are the authorized user of the payment method you use and all funds, which are on your account and used within the Services are legal.
      //         </p>
      //         <p class="leading-7">
      //             3.6. You must make all payments to us in good faith and not attempt to reverse a payment made or take any action which will cause such payment to be reversed by a third party.
      //         </p>
      //         <p class="leading-7">
      //             3.7. When placing bets, you may lose some or all of your money deposited to the Service in accordance with these Terms and you will be fully responsible for that loss.
      //         </p>
      //         <p class="leading-7">
      //             3.8. When placing bets, you must not use any information obtained in breach of any legislation in force in the country in which you were when the bet was placed.
      //         </p>
      //         <p class="leading-7">
      //             3.9. You are not acting on behalf of another party or for any commercial purposes, but solely on your own behalf as a private individual in a personal capacity.
      //         </p>
      //         <p class="leading-7">
      //             3.10. You must not either attempt to manipulate any market or element within the Service in bad faith nor in a manner that adversely affects the integrity of the Service or us.
      //         </p>
      //         <p class="leading-7">
      //             3.11. You must generally act in good faith in relation to the use of the Service at all times and for all bets made using the Service.
      //         </p>
      //         <p class="leading-7">
      //             3.12. You, or, if applicable, your employees, employers, agents, or family members, are not registered as an Affiliate in our Affiliate program.
      //         </p>
      //         <p class="leading-7">
      //             3.13. While using the Service at any time, you consent to provide us only true, real, and objective data on default and when we request it.
      //         </p>
      //         <p class="leading-7">
      //             3.14. You understand the volatility of the crypto market and you accept the possibility of your currency/currencies price changing while you are waiting for your withdrawal or your withdrawal is being processed by our Risk Department.
      //         </p>
      //         <p class="leading-7">
      //             3.15. You are a mentally competent person and you do not suffer from gambling addiction. In case a person with such a problem enters the Site, the responsibility lies on their side only.
      //         </p>
      //         <p class="leading-7">
      //             3.16. You agree not to use any third-party software in any of the subdivisions of the {{gameLink}} Alliance as well as not to abuse any game/functioning bugs found on the platform.
      //         </p>
      //         <p class="leading-7">
      //             3.17. You warrant that all information that you provide to us from the moment of registration and during the term of validity of this agreement is true, complete, correct, and that you shall immediately notify us of any change of such information.
      //         </p>
      //         <p class="leading-7">
      //             3.17.1. You confirm your understanding that the information which entered at the registration and during use the Service cannot be changed at your decision. To change any information, you should contact the support team. For the change of any information, the {{gameLink}} Alliance can request any documents for passing the KYC at its own decision.
      //         </p>
      //         <p class="leading-7">
      //             3.18. You warrant that you will not use our services while located in any jurisdiction that prohibits the placing and/or accepting of bets online and/or playing casino and/or live games.
      //         </p>
      //         <p class="leading-7">
      //             3.19. You also warrant that:
      //         </p>
      //      <ol class="pl-2 leading-7">
      //         <li><span class="">• </span>You participate in the Services on your own behalf and not on the behalf of any other person;</li>
      //         <li><span class="">• </span>You are solely responsible for reporting and accounting for any taxes applicable to you under relevant laws for any winnings that you receive from us;</li>
      //         <li><span class="">• </span>You are solely responsible for any applicable taxes which may be payable on cryptocurrency awarded to you through your using the Service.</li>
      //       </ol>
      //         <p class="leading-7">
      //             3.20. The user is obliged to correctly communicate with other users in all public and private chats. The user undertakes not to insult other users in chats or in any other public way. The user is obligated not to offend the service platform and its team in no way. The user is prohibited from writing, discussing, and commenting on racist, religious, and political topics on the platform. The user is obliged to not post illegal content, including but not limited to obscene language, offensive remarks, pornography, drugs, weapons, and violence.
      //         </p>
      //         <p class="leading-7">
      //             3.20.1. The user is obliged to communicate politely with the support service of the platform. Any display of disrespect, insults, humiliation, and other manifestations of aggression will be considered a violation of these Terms. In this case, the user may be denied support with subsequent possible blocking of the account.
      //         </p>
      //     `,
    },
  },
  {
    id: "restrictedUse",
    text: {
      title: t("termOfService:restrictedUse.title"),
      content: t("termOfService:restrictedUse.content", {
        age: 18,
        gameLink: gameLink,
      }),
      open: false,
      //   content: `
      //      <p class="leading-7">
      //      4.1. You must not use the Service:
      //      </p>
      //      <p class="leading-7">
      //      4.1.1. If you are under the age of {{age}} years (or below the age of majority as stipulated in the laws of the jurisdiction applicable to you) or if you are not legally able to enter into a binding legal agreement with us or you acting as an agent for, or otherwise on behalf, of a person under 18 years (or below the age of majority as stipulated in the laws of the jurisdiction applicable to you);
      //      </p>
      //      <p class="leading-7">
      //      4.1.2. If you reside in a country in which access to online gambling to its residents or to any person within such country is prohibited;
      //      </p>
      //      <p class="leading-7">
      //      4.1.3. To collect nicknames, e-mail addresses, and/or other information of other customers by any means (for example, by sending spam, other types of unsolicited emails, or the unauthorized framing of, or linking to, the Service);
      //      </p>
      //      <p class="leading-7">
      //      4.1.4. To disrupt or unduly affect or influence the activities of other customers or the operation of the Service generally;
      //      </p>
      //      <p class="leading-7">
      //      4.1.5. To promote unsolicited commercial advertisements, affiliate links, and other forms of solicitation which may be removed from the Service without notice;
      //      </p>
      //      <p class="leading-7">
      //      4.1.6. In any way which, in our reasonable opinion, could be considered as an attempt to: (i) cheat the Service or another Customer using the Service; or (ii) collude with any other Customer using the Service in order to obtain a dishonest advantage;
      //      </p>
      //      <p class="leading-7">
      //      4.1.7. To scrape our odds or violate any of our Intellectual Property Rights;
      //      </p>
      //      <p class="leading-7">
      //      4.1.8. For any unlawful activity whatsoever;
      //      </p>
      //      <p class="leading-7">
      //      4.1.9. Creating multiple accounts for the purpose of collusion, fraud, service abuse, and/or any kind of service manipulation is prohibited and may result in account closure.
      //      </p>
      //      <p class="leading-7">
      //      4.1.10. Any use of software which gives any advantage, include software which betting statistics software, sports betting scanners, or counts cards, analyzes the probability of a particular combination falling out or programs that help the user make a decision when playing or use strategies aimed at unfairly obtaining winnings or gaining an advantage over the casino is prohibited. Bets and funds which received from these bets will be regarded as illegal. The {{gameLink}} Alliance reserves the right to withhold these funds, including the user's deposit funds. The {{gameLink}} Alliance reserves the right, after withholding such funds, to block the account. The right to restore withholding funds and blocking account is carried out at the {{gameLink}} Alliance's sole discretion and cannot be appealed by the player.
      //      </p>
      //      <p class="leading-7">
      //      If the amount of illegally won funds is greater than the amount that is placed on the deposit account of such a player, the {{gameLink}} Alliance can recover these funds from the user, including claims.
      //      </p>
      //      <p class="leading-7">
      //      4.2. You cannot sell or transfer your account to third parties, nor can you acquire a player account from a third party.
      //      </p>
      //      <p class="leading-7">
      //      4.3. We may immediately terminate your account without written notice to you if you use the Service for unauthorized purposes. We may also take legal action against you for doing so in certain circumstances.
      //      </p>
      //      <p class="leading-7">
      //      4.4. Restrictions to the use of third-party products (Live, Table Games and Slots, etc.) are set on the side of the product provider and are not under the control of the {{gameLink}} Alliance.
      //      </p>
      //     `,
    },
  },
  {
    id: "registration",
    text: {
      title: t("termOfService:registration.title"),
      content: t("termOfService:registration.content", {
        gameLink: gameLink,
      }),
      open: false,
      //   content: `
      //   <p class="leading-7">
      //   You agree that at all times when using the Service:
      //   </p>
      //   <p class="leading-7">
      //   5.1. We reserve the right to refuse to accept a registration application from any applicant at our sole discretion and without any obligation to communicate a specific reason.
      //   </p>
      //   <p class="leading-7">
      //   5.2. Before using the Service, you must personally complete the registration form and read and accept these Terms. We may require you to become a verified Customer which includes passing certain checks. You may be required to provide valid proof of identification and any other document as it may be deemed necessary. This includes but is not limited to, a picture ID (copy of passport, driver's license, or national ID card) and a recent utility bill listing your name and address as proof of residence. We reserve the right to suspend wagering or restrict Account options on any Account until the required information is received. This procedure is done in accordance with the applicable gaming regulation and the anti-money laundering legal requirements. Additionally, you will need to fund your Service Account using the payment methods set out on the payment section of our Website.
      //   </p>
      //   <p class="leading-7">
      //   5.3. If You register via email You have to provide accurate contact information, inclusive of a valid email address (“Registered Email Address”), and update such information in the future to keep it accurate. It is your responsibility to keep your contact details up to date on your Account. Failure to do so may result in you failing to receive important Account related notifications and information from us, including changes we make to these Terms. We identify and communicate with our Customers via their Registered Email Address. It is the responsibility of the Customer to maintain an active and unique email account, to provide us with the correct email address, and to advise the Company of any changes in their email address. Each Customer is wholly responsible for maintaining the security of his Registered Email Address to prevent the use of his Registered Email Address by any third party. Company shall not be responsible for any damages or losses deemed or alleged to have resulted from communications between Company and the Customer using the Registered Email Address. We will immediately suspend your Account upon written notice to you to this effect if you intentionally provide false or inaccurate personal information.
      //   </p>
      //   <p class="leading-7">
      //   5.4. You are only allowed to register one Account with the Service. Accounts are subject to immediate closure if it is found that you have multiple Accounts registered with us. This includes the use of representatives, relatives, associates, affiliates, related parties, connected persons, and/or third parties operating on your behalf.
      //   </p>
      //   <p class="leading-7">
      //   5.5. In order to ensure your financial worthiness and to confirm your identity, we may ask you to provide us with additional personal information, such as your name and surname, or use any third-party information providers we consider necessary. In case any additional personal information should be obtained via third-party sources, we will inform you about the data obtained.
      //   </p>
      //   <p class="leading-7">
      //   5.6. You must keep your password for the Service confidential. Provided that the Account information requested has been correctly supplied, we are entitled to assume that bets, deposits, and withdrawals have been made by you. We advise you to change your password on a regular basis and never disclose it to any third party. It is your responsibility to protect your password and any failure to do so shall be at your sole risk, expense and responsibility. You may log out of the Service at the end of each session. If you believe any of your Account Information is being misused by a third party, or your Account has been hacked into, or your password has been discovered by a third party, you must notify us immediately. You must notify us if your Registered Email Address has been hacked into, we may, however, require you to provide additional information/ documentation so that we can verify your identity. We will immediately suspend your Account once we are aware of such an incident. In the meantime, you are responsible for all activity on your Account including third-party access, regardless of whether or not their access was authorized by you.
      //   </p>
      //   <p class="leading-7">
      //   5.7. You must not at any time transmit any content or other information on the Service to another Customer or any other party by way of screen capture (or another similar method), nor display any such information or content in a frame or in any other manner that is different from how it would appear if such Customer or third party had typed the URL for the Service into the browser line.
      //   </p>
      //   <p class="leading-7">
      //   5.8. When registering, you will receive the possibility to use all currencies available on the website. Those will be the currencies of your deposits, withdrawals, and bets placed and matched into the Service as set out in these Terms. Some payment methods do not process in all currencies. In such cases, a processing currency will be displayed, along with a conversion calculator available on the page.
      //   </p>
      //   <p class="leading-7">
      //   You can use all currencies available on the website. But, if you use currencies and/or win currencies that have low liquidity on most of the crypto exchanges or are presented in small quantities on the crypto market, we reserve the right to pay out your winnings in USDT. In the described case, you agree that the {{gameLink}} Alliance, at its sole discretion, might process and payout your winnings in USDT at an internally deduced exchange rate at the time of your winnings.
      //   </p>
      //   <p class="leading-7">
      //   5.9. We are under no obligation to open an account for you and our website sign-up page is merely an invitation to treat. It is entirely within our sole discretion whether or not to proceed with the opening of an account for you and, should we refuse to open an account for you, we are under no obligation to provide you with a reason for the refusal.
      //   </p>
      //   <p class="leading-7">
      //   5.10. Upon receipt of your application, we may be in touch to request further information and/ or documentation from you in order for us to comply with our regulatory and legal obligations.
      //   </p>
      //   <p class="leading-7">
      //   5.11. We allow only one account per e-mail address, wallet, etc. If more players wish to use the same account, exceptions can be made after proving the identity of all the connected account users. It is necessary to indicate correct and real names. Players who created multiple accounts with the sole intention of taking advantage of our bonus promotions (if any) will not be eligible to receive any winnings made with our bonuses. Furthermore, their accounts will be blocked upon recognition without prior notice.
      //   </p>
      //   <p class="leading-7">
      //   5.12. A player can have only one account. All duplicate player accounts will be counted as “duplicates” and will be closed immediately. Any winnings, bonuses, and returns that you have gained from the duplicate account we call into question, and also, we may reclaim it. You will return to us all demanded funds, which have been withdrawn from your duplicate account.
      //   </p>
      //   <p class="leading-7">
      //   5.13. We comply with Curacao Laws, legal regulations, and guidance for the prevention of money laundering and terrorism financing. All suspicious transactions will be investigated. In such cases, the company is prohibited to inform the player or third parties involved in the investigation. An exception can be details that an investigation is taking place or may be carried out or that information has been or may be transmitted to the competent authorities. In case of suspicious activity, the Company has the right to suspend, freeze, block, delete or close a player’s account and withhold funds according to law or if it is required by the competent authorities.
      //   </p>
      //   <p class="leading-7">
      //   5.14. On the Website, all transactions are checked to prevent money laundering and other illegal activity. If you agree with the Terms, you authorize us to undertake a personal identification check, due to our requirements or requirements from the third party (including regulatory authority) to confirm your identity and contact details. In certain circumstances, we may have to contact you and ask you to provide the necessary information in order to complete the check. If you do not provide us with the required information, the Company reserves the right to freeze or close your account until you have provided us with the requested information.
      //   </p>
      //   <p class="leading-7">
      //   5.15. If you do not confirm that you are already 18 years old, the Company has the right to freeze your account until you prove your age. If it is proved that you are younger than 18 years old and you did some actions on the Website, the provisions of Article 16 shall apply.
      //   </p>
      //   <p class="leading-7">
      //   5.16. If you breach these Terms, or we have a reasonable suspicion that you did so, we may with or without prior notice , terminate your account. In such case, all your outstanding bets will be canceled and your account will be closed, and we may also confiscate and recover from your account balance the amount of the winnings awarded or paid to you and all bonuses, bonus money, and other incentives, which you shall forfeit in such case. Following this, on your request and subject to our discretion, we will return the remainder of the real money balance of your account (if any) to you, subject to reasonable charges, regulatory obligations, and our ability to do so using the payment method we verified as belonging solely to you.
      //   </p>
      //   <p class="leading-7">
      //   5.17. Providing false and/or non-existent and/or misleading information by the user at the moment of registration and during the term of validity of this agreement is considered a gross violation of these Terms and is considered a fraud on the part of the User by the {{gameLink}} Alliance. In this case, or if we have a reasonable suspicion that you did so, we may, with or without prior notice, terminate your account without any compensation from us and without returning the remainder of the real money balance of your account to you.
      //   </p>
      //   `,
    },
  },
  {
    id: "yourAccount",
    text: {
      title: t("termOfService:yourAccount.title"),
      content: t("termOfService:yourAccount.content", {
        gameLink: gameLink,
        age: 18,
      }),
      open: false,
      //   content: `
      //   <p class="leading-7">
      //     6.1. Accounts could use several currencies, in this case, all Account balances and transactions appear in the currency used for the transaction.
      //   </p>
      //   <p class="leading-7">
      //     6.2. We do not give credit for the use of the Service.
      //   </p>
      //   <p class="leading-7">
      //     6.3. We may close or suspend an Account if you are not or we reasonably believe that you are not complying with these Terms, or to ensure the integrity or fairness of the Service or if we have other reasonable grounds to do so. We may not always be able to give you prior notice. If we close or suspend your Account due to you not complying with these Terms, we may cancel and/or void any of your bets and withhold any money in your account (including the deposit).
      //   </p>
      //   <p class="leading-7">
      //     6.4. We reserve the right to close or suspend any Account without prior notice and without returning all funds. Contractual obligations already matured will however be honored.
      //   </p>
      //   <p class="leading-7">
      //     6.5. We reserve the right to refuse, restrict, cancel or limit any wager at any time for whatever reason, including any bet perceived to be placed in a fraudulent manner in order to circumvent our betting limits and/or our system regulations.
      //   </p>
      //   <p class="leading-7">
      //     6.6. If any amount is mistakenly credited to your Account it remains our property and when we become aware of any such mistake, we shall notify you and the amount will be withdrawn from your Account.
      //   </p>
      //   <p class="leading-7">
      //     6.7. If for any reason, your Account goes overdrawn, you shall be in debt to us for the amount overdrawn.
      //   </p>
      //   <p class="leading-7">
      //     6.8. You must inform us as soon as you become aware of any errors with respect to your Account. In the event we deem in our sole discretion that you have been taking unfair advantage of any bonuses or have executed any other act in bad faith in relation to a bonus, promotion offered on the Website, we shall have the right to block or terminate your account and, in such circumstances, we shall be under no obligation to refund you any funds that may be in your Account.
      //   </p>
      //   <p class="leading-7">
      //     6.9. Please remember that betting is purely for entertainment and pleasure and you should stop as soon as it stops being fun. Absolutely do not bet anything you can’t afford to lose. If you feel that you may have lost control of your gambling, we offer a self-exclusion option. Just send a message to our Customer Support Department using your account that you wish to Freeze your account and this request will take effect within 24 hours from the moment of its receipt.
      //   </p>
      //   <p class="leading-7">
      //     6.10. You cannot transfer, sell, or pledge your account to another person. This prohibition includes the transfer of any assets of the value of any kind, including but not limited to ownership of accounts, winnings, deposits, bets, rights, and/or claims in connection with these assets, legal, commercial, or otherwise. The prohibition on said transfers also includes, however is not limited to the encumbrance, pledging, assigning, usufruct, trading, brokering, hypothecation, and/or gifting in cooperation with a fiduciary or any other third party, company, natural or legal individual, foundation, and/or association in any way shape or form.
      //   </p>
      //   <p class="leading-7">
      //     6.11. Should you wish to close your account with us, please send a message from your Account to our Customer Support Department via the links on the Website.
      //   </p>
      //   <p class="leading-7">
      //     6.12. The {{gameLink}} Alliance keeps the data on the betting history for no longer than 60 days.
      //   </p>
      //   <p class="leading-7">
      //     6.13. When the User makes a request for the account closure, the User accepts the fact that their account is not going to be ever unlocked and the entire history of such an account will be permanently deleted from the service database. It is pretty advisable to withdraw all of your funds before closing the account.
      //   </p>
      //   <p class="leading-7">
      //     6.14. An account that is not used by the user for 12 twelve calendar months may be frozen by the service's decision. If the user wants to unfreeze such an account, he must pass the verification and confirm that the frozen account belongs to him.
      //   </p>
      // `,
    },
  },
  {
    id: "web3Registration",
    text: {
      title: t("termOfService:web3Registration.title"),
      content: t("termOfService:web3Registration.content", {
        gameLink: gameLink,
      }),
      open: false,
      //   content: `
      //   <p class="leading-7">
      //     7.1. As a Web 3.0 application, the Telegram interface {{gameLink}} Alliance operates without direct access or control over user authentication processes. Users are solely responsible for safeguarding the security of their Telegram accounts, which serve as the primary access point for the service. This includes maintaining secure login practices, monitoring for unauthorized access, and using Telegram's security features such as two-factor authentication where possible.
      //   </p>
      //   <p class="leading-7">
      //     7.2. The platform is not liable for any loss, unauthorized access, or damages resulting from compromised Telegram accounts. Due to the decentralized nature of authentication, the service cannot assist in restoring account access or verifying identity in the event of a lost or compromised Telegram login. Users acknowledge that the {{gameLink}} Alliance's role is limited to platform operations and excludes account recovery.
      //   </p>
      //   `,
    },
  },
  {
    id: "depositOfFunds",
    text: {
      title: t("termOfService:depositOfFunds.title"),
      content: t("termOfService:depositOfFunds.content", {
        gameLink: gameLink,
      }),
      open: false,
      //   content: `
      //   <p class="leading-7">
      //     8.1. Platform has a minimum deposit amount for every currency. Sending any amount below the minimum will result in funds loss and is not refundable. The maximum deposit amount is not limited. The {{gameLink}} Alliance doesn't have any fees for deposits. Some of the deposits may take some time related to the network hash rate.
      //   </p>
      //   <p class="leading-7">
      //     8.2. Fees and charges may apply to customer deposits and withdrawals, which can be found on the Website. In most cases, we absorb transaction fees for deposits to your Account. You are responsible for your own wallet charges that you may incur due to depositing funds with us.
      //   </p>
      //   <p class="leading-7">
      //     8.3. You agree to fully pay any and all payments and charges due to us or to payment providers in connection with your use of the Service. You further agree not to make any charge-backs or renounce or cancel or otherwise reverse any of your deposits, and in any such event you will refund and compensate us for such unpaid deposits including any expenses incurred by us in the process of collecting your deposit, and you agree that any winnings from wagers utilizing those charged back funds will be forfeited.
      //   </p>
      //   <p class="leading-7">
      //     8.4. Funds originating from criminal and/or illegal and/or unauthorized activities must not be deposited to the Site.
      //   </p>
      //   <p class="leading-7">
      //     8.5. We reserve the right to forfeit any positive balance on your Account in case of reset of the wager or any actions that belong to duplicate accounts, conspirations, frauds, criminal activity, or fakes.
      //   </p>
      //   <p class="leading-7">
      //     8.6. We do not offer refunds for deposits made on the service. By depositing money, you agree not to make any charge-backs, reversals, refunds, or otherwise cancel any deposits into your Account, and agree to refund and compensate us for unpaid deposits.
      //   </p>
      // `,
    },
  },
  {
    id: "withdrawalOfFunds",
    text: {
      title: t("termOfService:withdrawalOfFunds.title"),
      content: t("termOfService:withdrawalOfFunds.content", {
        dollars: 300000,
        gameLink: gameLink,
      }),
      open: false,
      //   content: `
      //         <p class="leading-7">
      //         9.1. Due to the workflow of our anti-fraud system, the waiting time for your withdrawal can be prolonged up to the point when all the needed procedures will be conducted to supply a decent level of financial security for users (up to seven (7) days and more if needed).
      //         </p>
      //         <p class="leading-7">
      //         9.2. Please note that we cannot guarantee the successful processing of withdrawals or refunds in the event you break the rules stated in our Terms and Conditions.
      //         </p>
      //         <p class="leading-7">
      //         9.3. The responsibility for withdrawing the funds lies with the User only and the Site does not refund the funds that may occur as lost funds in case the receiving wallet/platform doesn’t accept transactions from smart-contract, any definite coins, or in case the user chose the wrong chain of transfer.
      //         </p>
      //         <p class="leading-7">
      //         9.4. We reserve the right to change the withdrawal fee at any time without prior notice.
      //         </p>
      //         <p class="leading-7">
      //         9.5. Withdrawal processing may take up to 24 hours, in some cases may be postponed for a longer period, not limited. The {{gameLink}} Alliance reserves the right, at any time, to hold withdrawals to verify the source of obtaining and reserves the right to restrict the Service, deposit, or withdrawal until the investigation is sufficiently determined, or for any other reason at the Risk Department discretion. The {{gameLink}} Alliance reserves the right to limit the number of transactions for some time without warning.
      //         </p>
      //         <p class="leading-7">
      //         9.6. If your withdrawal is significantly greater than your total deposit amount, The {{gameLink}} Alliance, in exceptional cases, reserves the right to pay the winning in equal parts within 30 days at a maximum.
      //         </p>
      //         <p class="leading-7">
      //         9.7 Regardless of the amount of your win for any bet or spin, including any bonus round or a free spin, as well as free spins purchased on our platform, the amount of win which we are obliged to pay you may not exceed the equivalent of {{dollars}} US dollars (“Maximum win limit”) in any cryptocurrency, fiat or any other currency. You confirm that you understand that some games have the technical ability to win more than the Maximum Win Limit, but you agree that we have the right to cut the amount above the Maximum Win Limit from Your Account and pay you only the Maximum Win Limit. We have this right in respect of any wins that have exceeded the Maximum Win Limit. The decision to cut the amount above the Maximum Win Limit is made based on your game history, betting level, and account, as well as other information that we analyze.
      //         </p>
      //         <p class="leading-7">
      //         In addition, the total win amount, including the amount that is above the Maximum win limit, may be credited to your account, but the paid amount will not exceed the Maximum payout limit. In any case, we reserve the right to make any decision on the payment of an amount above the Maximum Win Limit.
      //         </p>
      //         <p class="leading-7">
      //         The {{gameLink}} Alliance reserves the right to pay the Maximum Win Limit in equal parts within 90 days at a maximum.
      //         </p>
      //         <p class="leading-7">
      //         You confirm that you understand that if we make a decision to cut the payout to the amount of the Maximum Win Limit, we will send you an appropriate communication. In this case, after receiving communication, you will not have any claims to the platform, as the acceptance of these Terms has confirmed your awareness of the implementation of the Maximum Win Limit on the platform. You confirm your understanding that implementation of the Maximum Win Limit is the right of the service, which in no way violates the rights of the platform user. Any claims made by the User after receiving the relevant letter of cutting the amount will be considered as evidence of abuse of rights by the user in order to unreasonably obtain additional funds and may be construed as extortion.
      //         </p>
      //         <p class="leading-7">
      //         9.9.  If you have set any limits on max withdrawal, then any of your transactions created earlier may be rejected by the risk department, or rejected automatically.
      //         </p>
      //         <p class="leading-7">
      //         9.10. You confirm your understanding that if you use currencies and/or win currencies that have low liquidity on most of the crypto exchanges or are presented in small quantities on the crypto market and want to withdraw it, we reserve the right to stop this withdrawal for conversion into USDT.
      //         </p>
      //         <p class="leading-7">
      //         The list of such currencies is not permanent and may constantly change. Therefore, each decision is made on a case-by-case basis. The decision to convert a specific currency is made at the discretion of the service and cannot be appealed by the player.
      //         </p>
      //         <p class="leading-7">
      //         You acknowledge your understanding that in this case, transactions may take longer to be processed than these terms allow. In any case, such transaction processing time cannot be longer than 48 hours.
      //         </p>
      //     `,
    },
  },
  {
    id: "paymentTransactionsAndProcessors",
    text: {
      title: t("termOfService:paymentTransactionsAndProcessors.title"),
      content: t("termOfService:paymentTransactionsAndProcessors.content", {
        gameLink: gameLink,
      }),
      open: false,
      //   content: `
      //   <p class="leading-7">
      //  10.1. You are fully responsible for paying all monies owed to us. You must make all payments to us in good faith and not attempt to reverse a payment made or take any action which will cause such payment to be reversed by a third party in order to avoid a liability legitimately incurred. You will reimburse us for any charge-backs, denial, or reversal of payment you make and any loss suffered by us as a consequence thereof.
      // </p>
      // <p class="leading-7">
      //  10.2. Before making a deposit, the User must be sure of the correctness of the deposit address, destination tag (memo) if required, and the chain of the token they are depositing. They must also meet the minimum deposit amount to ensure the deposit will be credited and reflected in the balance. In case the user makes a mistake in the deposit/withdrawal, this is the user's personal responsibility. The {{gameLink}} Alliance is not responsible for this.
      //  </p>
      //  <p class="leading-7">
      //  10.3. All transactions made on our site might be checked to prevent money laundering or terrorism financing activity. Suspicious transactions will be reported to the relevant authority.
      //  </p>
      //  `,
    },
  },
  {
    id: "errors",
    text: {
      title: t("termOfService:errors.title"),
      content: t("termOfService:errors.content"),
      open: false,
      //   content: `
      //     <p class="leading-7">
      //         11.1. In the event of an error or malfunction of our system or processes, all bets are rendered void. You are under an obligation to inform us immediately as soon as you become aware of any error with the Service. In the event of communication or system errors or bugs or viruses occurring in connection with the Service and/or payments made to you as a result of a defect or error in the Service, we will not be liable to you or to any third party for any direct or indirect costs, expenses, losses or claims arising or resulting from such errors, and we reserve the right to void all games/bets in question and take any other action to correct such errors.
      //     </p>
      //     <p class="leading-7">
      //         11.2. We make every effort to ensure that we do not make errors in posting bookmaker lines. However, if as a result of human error or system problems, a bet is accepted at an odd that is: materially different from those available in the general market at the time the bet was made; or clearly incorrect given the chance of the event occurring at the time the bet was made, then we reserve the right to cancel or void that wager or to cancel or void a wager made after an event has started.
      //     </p>
      //     <p class="leading-7">
      //         11.3. We have the right to recover from you any amount overpaid and to adjust your Account to rectify any mistake. An example of such a mistake might be where a price is incorrect or where we enter a result of an event incorrectly. If there are insufficient funds in your Account, we may demand that you pay us the relevant outstanding amount relating to any erroneous bets or wagers. Accordingly, we reserve the right to cancel, reduce or delete any pending plays, whether placed with funds resulting from the error or not.
      //     </p>
      //     `,
    },
  },
  {
    id: "rulesOfPlayRefundsAndCancellationsInSportsBetting",
    text: {
      title: t("termOfService:rulesOfPlayRefundsAndCancellationsInSportsBetting.title"),
      content: t("termOfService:rulesOfPlayRefundsAndCancellationsInSportsBetting.content"),
      open: false,
      //   content: `
      //   <p class="leading-7">
      //     12.1. The winner of an event will be determined on the date of the event's settlement, and we will not recognize protested or overturned decisions for wagering purposes.
      //   </p>
      //   <p class="leading-7">
      //     12.2. In the situations where the bet or odds were calculated incorrectly (due to human error, system error, or mistakes made by the referring results source), we will reset/correct the results.
      //   </p>
      //   <p class="leading-7">
      //     12.3. If a match result is overturned for any reason by the governing body of the match within the payout period then all money will be refunded.
      //   </p>
      //   <p class="leading-7">
      //     12.4. If a draw occurs in a game where a draw option is offered, all stakes on a team win or lose will be lost. If a draw option is not offered then everyone receives a refund in the outcome of a draw in the match. And if a draw option has not been made available, then extra time will count, if played.
      //   </p>
      //   <p class="leading-7">
      //     12.5. Minimum and maximum wager amounts on all events will be determined by us and are subject to change without prior written notice. We also reserve the right to adjust limits on individual Accounts as well.
      //   </p>
      //   <p class="leading-7">
      //     12.6. Customers are solely responsible for their own Account transactions. Once a transaction is complete, it cannot be changed. We do not take responsibility for missing or duplicate wagers made by the Customer and will not entertain discrepancy requests because a play is missing or duplicated. Customers may review their transactions in the My Bets section of the site after each session to ensure all requested wagers are accepted.
      //   </p>
      //   <p class="leading-7">
      //     12.7. A matchup will have action as long as the two teams are correct, regardless of the League header in which it is placed on our Website.
      //   </p>
      //   <p class="leading-7">
      //     12.8. The start dates and times displayed on the Website for matches are an indication only and are not guaranteed to be correct. If a match is suspended or postponed and not resumed within 72 hours from the actual scheduled start time, the match will have no action, and wagers will be refunded. The exception is any wager on whether a team/player advances in a tournament or wins the tournament will have action regardless of a suspended or postponed match.
      //   </p>
      //   <p class="leading-7">
      //     12.9. The statistics of the official scoring provider or the official website of the respective competition or match are used to calculate bets. If statistics from the official scoring provider or the official website are not available, or if there are clear indications that statistics from the official scoring provider or official website are incorrect, we will wait for the official result to calculate the markets. The service reserves the right to recalculate bets, the result of which has been changed after the end of the event or incorrectly calculated before.
      //   </p>
      //   <p class="leading-7">
      //     12.10. If an event is posted by us with an incorrect date, all wagers have action based on the date announced by the governing body.
      //   </p>
      //   <p class="leading-7">
      //     12.11. If a team is using stand-ins, the result is still valid as it was the team's choice to use the stand-ins.
      //   </p>
      //   <p class="leading-7">
      //     12.12. The Company reserves the right to remove events, markets, and any other products from the Website.
      //   </p>
      //   <p class="leading-7">
      //     12.13. Bets canceled by the provider for reasons provided in the Sports Betting terms, as well as bets for which the user used the cashout function, will not be taken into account either in tournaments and other events.
      //   </p>
      //   `,
    },
  },
  {
    id: "communicationsAndNotices",
    text: {
      title: t("termOfService:communicationsAndNotices.title"),
      content: t("termOfService:communicationsAndNotices.content"),
      open: false,
      // content: `
      // <p class="leading-7">
      // 13.1. All communications and notices to be given under these Terms by you to us shall be sent using a Customer Support form on the platform.
      // </p>
      // <p class="leading-7">
      // 13.2. All communications and notices to be given under these Terms by us to you shall, unless otherwise specified in these Terms, be posted on the Website or communicated via chat to the relevant Customer. The method of such communication shall be at our sole and exclusive discretion.
      // </p>
      // <p class="leading-7">
      // 13.3. All communications and notices to be given under these Terms by either you or us, shall be in writing in the English language and must be given to and from customer service chat in your Account.
      // </p>
      // <p class="leading-7">
      // 13.4. From time to time, we may contact you by email for the purpose of offering you information about betting, unique promotional offerings, and other information from the platform You agree to receive such emails when you agree to these Terms when registering at the Website.
      // </p>
      // `
    },
  },
  {
    id: "mattersBeyondOurControl",
    text: {
      title: t("termOfService:mattersBeyondOurControl.title"),
      content: t("termOfService:mattersBeyondOurControl.content"),
      open: false,
      //   content: `
      //   <p class="leading-7">
      //     We cannot be held liable for any failure or delay in providing the Service due to an event of Force Majeure which could reasonably be considered to be outside our control despite our execution of reasonable preventative measures such as: an act of God; trade or labor dispute; power cut; act, failure or omission of any government or authority; obstruction or failure of telecommunication services; or any other delay or failure caused by a third party, and we will not be liable for any resulting loss or damage that you may suffer. In such an event, we reserve the right to cancel or suspend the Service without incurring any liability.
      //   </p>
      //   `
    },
  },
  {
    id: "liability",
    text: {
      title: t("termOfService:liability.title"),
      content: t("termOfService:liability.content"),
      open: false,
      //   content: `
      //   <p class="leading-7">
      //   15.1. To the extent permitted by applicable law, we will not compensate you for any reasonably foreseeable loss or damage (either direct or indirect) you may suffer if we fail to carry out our obligations under these terms unless we breach any duties imposed on us by law (including if we cause death or personal injury by our negligence) in which case we shall not be liable to you if that failure is attributed to: (I) Your own fault; (II) A third party unconnected with our performance of these terms (for instance problems due to communications network performance, congestion, and connectivity or the performance of your computer equipment); or (III) Any other events which neither we nor our suppliers could have foreseen or forestalled even if we or they had taken reasonable care. As this service is for consumer use only we will not be liable for any business losses of any kind.
      //   </p>
      //   <p class="leading-7">
      //   15.2. We strongly recommend that You: (I) Take care to verify the suitability and compatibility of the service with your own computer equipment prior to use; and (II) Take reasonable precautions to protect yourself against harmful programs or devices including through installation of antivirus software.
      //   </p>
      //   `,
    },
  },
  {
    id: "gamblingByThoseUnderAge",
    text: {
      title: t("termOfService:gamblingByThoseUnderAge.title"),
      content: t("termOfService:gamblingByThoseUnderAge.content", { years: 18 }),
      open: false,
      //   content: `
      //     <p class="leading-7">
      //     16.1. If we suspect that you are currently under {{years}} years or were under {{years}} years (or below the age of majority as stipulated in the laws of the jurisdiction applicable to you) when you placed any bets through the Service your Account will be suspended (locked) to prevent you placing any further bets or making any withdrawals from your Account. We will then investigate the matter, including whether you have been betting as an agent for, or otherwise on behalf of, of a person under {{years}} years (or below the age of majority as stipulated in the laws of the jurisdiction applicable to you). If have found that you: (a) are currently; (b) were under 18 years or below the majority age which applies to you at the relevant time; or (c) have been betting as an agent for or at the behest of a person under {{years}} years or below the majority age which applies: all winnings currently or due to be credited to your Account will be retained; all winnings gained from betting through the Service whilst under age must be paid to us on demand (if you fail to comply with this provision we will seek to recover all costs associated with recovery of such sums); and/or any monies deposited in your Account which are not winnings will be returned to you OR retained until you turn 18 years old at our sole discretion. We reserve the right to deduct payment transaction fees from the amount to return, including transaction fees for deposits to your account which we covered.
      //     </p>
      //     <p class="leading-7">
      //     16.2. This condition also applies to you if you are over the age of {{years}} years but you are placing your bets within a jurisdiction that specifies a higher age than {{years}} years for legal betting and you are below that legal minimum age in that jurisdiction.
      //     </p>
      //     <p class="leading-7">
      //     16.3. In the event we suspect you are in breach of the provisions of this Clause or are attempting to rely on them for a fraudulent purpose, we reserve the right to take any action necessary in order to investigate the matter, including informing the relevant law enforcement agencies.
      //     </p>
      //    `,
    },
  },
  {
    id: "antiFraudPolicy",
    text: {
      title: t("termOfService:antiFraudPolicy.title"),
      content: t("termOfService:antiFraudPolicy.content", {
        dollars: "$100",
        gameLink: gameLink,
      }),
      open: false,
      //   content: `
      //     <p class="leading-7">
      //     17.1. The {{gameLink}} Alliance prohibits and rejects the use of the Service for any form of illicit activity, including money laundering, terrorist financing, or trade sanctions violations. Accounts suspected of Money Laundering by using the Service may be blocked, and transactions may be stopped until the Risk department finishes all the required procedures. According to the service AML policy, all deposits must meet a basic rollover requirement. A rollover means that all users must do a 100% wager for all coming deposits before a withdrawal can be made . That means if your deposit is {{dollars}} in USDT, for example, you should wager at least {{dollars}} in USDT (for gaming activity) before withdrawal may be approved. This rule is applied to every User's balance. The Risk department is eligible to stop every suspicious transaction to prevent money laundering. Users' accounts may be under investigation by the Risk Department until all requirements are met, and payment will be stopped at the time of the investigation.
      //     </p>
      //     <p class="leading-7">
      //     17.1.1. The Digital Assets, which you have topped up or will top up into your account, or the funds, which you have used or will use for the purchase of the Digital Assets to be topped up into your account, as the case may be, are not derived from money laundering, terrorist financing, fraud or any other illegal or criminal activity under any  Law in the respective jurisdiction.
      //     </p>
      //     <p class="leading-7">
      //     17.1.2. The {{gameLink}} Alliance reserves the right, without explaining the reason, to ask you for confirmation of the origin of the funds that you have topped up or will top up into your account, or the funds that you have used or will use for the purchase of the Digital Assets to be topped up into your account. The {{gameLink}} Alliance reserves the right to freeze your funds until you confirm the origin of these funds.
      //     </p>
      //     <p class="leading-7">
      //     17.1.3. The {{gameLink}} Alliance reserves the right to restrict, suspend, or terminate access to the Platform without notice where:
      //     </p>

      // <ol class="pl-2 leading-7">
      //   <li><span class="">• </span>We reasonably suspect that your account is the subject of an operational or other error, in which case we may be required to suspend access to your account until such time as the error is rectified;</li>
      //   <li><span class="">• </span>We reasonably suspect that your Account has been or is being used in relation to any unlawful, fraudulent, or Prohibited Activity, or in breach of these Terms;</li>
      //   <li><span class="">• </span>We reasonably suspect that you or your Account has been associated with, or poses a high risk of, money laundering, financing of terrorism, fraud, or any other financial crime;</li>
      //   <li><span class="">• </span>We reasonably suspect your involvement in any attempt to gain unauthorized access to any Account;</li>
      //   <li><span class="">• </span>Your Account is the subject of any legal, regulatory, or government process, and/or we, in our sole discretion, consider there to be a heightened risk of legal or regulatory non-compliance;</li>
      //   <li><span class="">• </span>We are compelled to do so by a valid subpoena, court order, or other binding order of a government or regulatory authority; or</li>
      //   <li><span class="">• </span>Your name appears on a government or international body sanctions list.</li>
      // </ol>
      //     <p class="leading-7">
      //     Suspicious accounts can also be considered accounts that have no activity on the platform and/or perform the same type of operations for a certain period of time.
      //     </p>
      //     <p class="leading-7">
      //     17.1.4.The {{gameLink}} Alliance reserves the right to require the user to withdraw funds from the same wallet from which the deposit was made. The service also reserves the right, in the event of suspicion of a violation of the AML policy, to require you to undergo a KYC at any stage of interaction, both at the stage of depositing funds and during their withdrawal.
      //     </p>
      //     <p class="leading-7">
      //     17.2. Know your Customer (“KYC”) - The {{gameLink}} Alliance reserves the right, at any time, to ask for any KYC documentation if it is necessary. It reserves the right to restrict the Service, deposit, or withdrawal until identity is sufficiently determined, or for any other reason at the Risk Department's discretion. The {{gameLink}} Alliance's defined 7 days’ first response as eligible during the KYC procedure. The full procedure should be done in no more than 30 days after the first response from the Risk department communication. In case of fraud suspicion and if the user declines the requested information from the Risk department or the eligible timeline will pass, the service reserves the right to close access to the user's account permanently.
      //     </p>
      //     <p class="leading-7">
      //     17.2.1. KYC Procedures may include any of the following: requesting personal information about the User in order to identify him/her, which may include requesting a valid  identification document and a selfie; verifying the personal information provided by the User in the moment of registration and during use of the Service; requesting the information and documents about the User’s occupation, source of funds and source of income used by the  User in the Services; requesting personal information about the User and about the location and jurisdiction from which the User uses the Services in order to that he/she confirmed that he/she not use our services while located in any jurisdiction that prohibits the placing and/or accepting of bets online and/or playing casino and/or live games and/or restricted country; checking the personal and professional information about the User; checking and analyzing the gambling activity pattern of the User; any other information which the service deems necessary to determine the identity and location of a User.
      //     </p>
      //     <p class="leading-7">
      //     17.2.2. All information and documents that the {{gameLink}} Alliance receives from the User is strictly confidential. Our team takes all measures within its power to securely store such information and prevent its leakage. When we receive your information and documents, we will take reasonable steps to protect your personal information from misuse, loss, and unauthorized access, modification, and disclosure, including by using password protected systems and databases, and as well as using cryptographic encryption. You can request the deletion of your personal data addressed to our support team.
      //     </p>
      //     <p class="leading-7">
      //     17.2.3. All information processed by us may be transferred, processed, and stored anywhere in the world, including but not limited to other countries, which may have data protection laws that are different from the laws where you live. We endeavor to safeguard your information consistent with the requirements of applicable laws. We store the personal information for as long as you use our Services or as necessary to fulfill the purpose(s) for which it was collected, provide our Services, resolve disputes, establish legal defenses, conduct audits, pursue legitimate business purposes, enforce our agreements, and comply with applicable laws. We will destroy or permanently de-identify the Personal Information we hold when it is no longer required for any purpose including our legal or operational obligations.
      //     </p>
      //     <p class="leading-7">
      //     17.3. We will seek criminal and contractual sanctions against any Customer involved in fraud, dishonesty, or criminal acts. We will withhold payment to any Customer where any of these are suspected. The Customer shall identify and shall be liable to pay to us on demand all costs, charges, or losses sustained or incurred by us (including any direct, indirect, or consequential losses, loss of profit, loss of business, and loss of reputation) arising directly or indirectly from the Customer’s fraud, dishonesty or criminal act.
      //     </p>
      //     `,
    },
  },
  {
    id: "intellectualProperty",
    text: {
      title: t("termOfService:intellectualProperty.title"),
      content: t("termOfService:intellectualProperty.content"),
      open: false,
      //     content: `
      //     <p class="leading-7">
      //   18.1. Any unauthorized use of our name and logo may result in legal action being taken against you.
      //   </p>
      //   <p class="leading-7">
      //   18.2. As between us and you, we are the sole owners of the rights in and to the Service, our technology, software, and business systems (the "Systems") as well as our odds. you must not use your personal profile for your own commercial gain (such as selling your status update to an advertiser); and when selecting a nickname for your Account we reserve the right to remove or reclaim it if we believe it appropriate.
      //   </p>
      //   <p class="leading-7">
      //   18.3. You may not use our URL, trademarks, trade names and/or trade dress, logos ("Marks"), and/or our odds in connection with any product or service that is not ours, that in any manner is likely to confuse customers or in the public or that in any manner disparages us.
      //   </p>
      //   <p class="leading-7">
      //   18.4. Except as expressly provided in these Terms, we and our licensors do not grant you any express or implied rights, license, title, or interest in or to the Systems or the Marks and all such rights, license, title, and interest specifically retained by us and our licensors. You agree not to use any automatic or manual device to monitor or copy web pages or content within the Service. Any unauthorized use or reproduction may result in legal action being taken against you.
      //   </p>
      //   `
    },
  },
  {
    id: "yourLicense",
    text: {
      title: t("termOfService:yourLicense.title"),
      content: t("termOfService:yourLicense.content"),
      open: false,
      //   content: `
      //   <p class="leading-7">
      //   19.1. Subject to these Terms and your compliance with them, we grant to you a non-exclusive, limited, non-transferable, and non-sublicensable license to access and use the Service for your personal non-commercial purposes only. Our license to you terminates if our agreement with you under these Terms ends.
      //   </p>
      //   <p class="leading-7">
      //   19.2. Save in respect of your own content, you may not under any circumstances modify, publish, transmit, transfer, sell, reproduce, upload, post, distribute, perform, display, create derivative works from, or in any other manner exploit, the Service and/or any of the content thereon or the software contained therein, except as we expressly permit in these Terms or otherwise on the Website. No information or content on the Service or made available to you in connection with the Service may be modified or altered, merged with other data, or published in any form including for example screen or database scraping and any other activity intended to collect, store, reorganize or manipulate such information or content.
      //   </p>
      //   <p class="leading-7">
      //   19.3. Any non-compliance by you with this Clause may also be a violation of our or third parties’ intellectual property and other proprietary rights which may subject you to civil liability and/or criminal prosecution.
      //   </p>
      //   `
    },
  },
  {
    id: "yourConductAndSafety",
    text: {
      title: t("termOfService:yourConductAndSafety.title"),
      content: t("termOfService:yourConductAndSafety.content"),
      open: false,
      //             content: `
      //             <p class="leading-7">
      //        20.1. For your protection and protection of all our Customers, the posting of any content on the Service, as well as conduct in connection therewith and/or the Service, which is in any way unlawful, inappropriate or undesirable is strictly prohibited (“Prohibited Behaviour”).
      //             </p>
      //             <p class="leading-7">
      //        20.2. If you engage in Prohibited Behaviour, or we determine in our sole discretion that you are engaging in Prohibited Behaviour, your Account and/or your access to or use of the Service may be terminated immediately without notice to you. Legal action may be taken against you by another Customer, other third party, enforcement authorities, and/or us with respect to you having engaged in Prohibited Behaviour.
      //             </p>
      //             <p class="leading-7">
      //        20.3. Prohibited Behaviour includes, but is not limited to, accessing or using the Service to:
      //             </p>

      //     <ol class="pl-2 leading-7">
      //       <li><span class="">• </span>promote or share information that you know is false, misleading, or unlawful; </li>
      //   <li><span class="">• </span>conduct any unlawful or illegal activity, such as, but not limited to, any activity that furthers or promotes any criminal activity or enterprise, violates another Customer's or any other third party’s privacy or other rights or that creates or spreads computer viruses;</li>
      //   <li><span class="">• </span>harm minors in any way;</li>
      //   <li><span class="">• </span>transmit or make available any content that is unlawful, harmful, threatening, abusive, tortuous, defamatory, vulgar, obscene, lewd, violent, hateful, or racially or ethnically or otherwise objectionable;</li>
      //   <li><span class="">• </span>transmit or make available any content that the user does not have a right to make available under any law or contractual or fiduciary relationship, including without limitation, any content that infringes a third party’s copyright, trademark or other intellectual property and proprietary rights;</li>
      //   <li><span class="">• </span>transmit or make available any content or material that contains any software virus or other computer or programming code (including HTML) designed to interrupt, destroy or alter the functionality of the Service, its presentation, or any other website, computer software, or hardware;</li>
      //   <li><span class="">• </span>interfere with, disrupt or reverse engineer the Service in any manner, including, without limitation, intercepting, emulating or redirecting the communication protocols used by us, creating or using cheats, mods or hacks or any other software designed to modify the Service, or using any software that intercepts or collects information from or through the Service;</li>
      //   <li><span class="">• </span>retrieve or index any information from the Service using any robot or another automated mechanism; </li>
      //   <li><span class="">• </span>participate in any activity or action that, in the sole and entire unfettered discretion of us results or may result in another customer being defrauded or scammed; </li>
      //   <li><span class="">• </span>transmit or make available any unsolicited or unauthorized advertising or mass mailing such as, but not limited to, junk mail, instant messaging, "spam", chain letters, pyramid schemes, or other forms of solicitations;</li>
      //   <li><span class="">• </span>create Accounts on the Website by automated means or under false or fraudulent pretenses;</li>
      //   <li><span class="">• </span>impersonate another customer or any other third party; </li>
      //   <li><span class="">• </span>using of the cheating and unfair advantages including system malfunction and errors, also using of bots (automatic players) or exploitation of the “errors’; </li>
      //   <li><span class="">• </span>criminal activities, including money laundering and other criminal intrusions. </li>
      //     </ol>
      //             <p class="leading-7">
      //        20.4. If you find or suspect that the player is cheating, colluding, or undertaking fraudulent activities, please inform our representatives immediately. The Company reserves the right to terminate games or events in each of the above cases and in any other instances to avoid fraud.
      //             </p>
      //             <p class="leading-7">
      //        20.5. The above list of Prohibited Behaviour is not exhaustive and may be modified by us at any time or from time to time. We reserve the right to investigate and to take all such actions as we in our sole discretion deem appropriate or necessary under the circumstances, including without limitation deleting the Customer’s posting(s) from the Service and/or terminating their Account, and take any action against any Customer or third party who directly or indirectly in, or knowingly permits any third party to directly or indirectly engage in Prohibited Behaviour, with or without notice to such Customer or third party.
      //             </p>
      //             `
    },
  },
  {
    id: "linksToOtherWebsites",
    text: {
      title: t("termOfService:linksToOtherWebsites.title"),
      content: t("termOfService:linksToOtherWebsites.content"),
      open: false,
      //   content: `
      //     <p class="leading-7">
      //     The Service may contain links to third-party websites that are not maintained by, or related to, us, and over which we have no control. Links to such websites are provided solely as a convenience to Customers and are in no way investigated, monitored, or checked for accuracy or completeness by us. Links to such websites do not imply any endorsement by us of, and/or any affiliation with, the linked websites or their content or their owner(s). We have no control over or responsibility for the availability nor their accuracy, completeness, accessibility, and usefulness. Accordingly, when accessing such websites, we recommend that you take the usual precautions when visiting a new website, including reviewing their privacy policy and terms of use.
      //     </p>
      //     `,
    },
  },
  {
    id: "complaints",
    text: {
      title: t("termOfService:complaints.title"),
      content: t("termOfService:complaints.content"),
      open: false,
      //   content: `
      //     <p class="leading-7">
      //     22.1. If you have any concerns or questions regarding these Terms you should contact our Customer Service Department via the links on the Website to start a communication with us.
      //     </p>
      //     <p class="leading-7">

      //     22.2. Notwithstanding the foregoing, we take no liability whatsoever to you or to any third party when responding to any complaint that we received or took action in connection therewith.
      //     </p>
      //     <p class="leading-7">
      //     22.3. If a Customer is not satisfied with how a bet has been settled, then the Customer should provide details of their grievance to our Customer Service Department. We shall use our reasonable endeavors to respond to queries of this nature within a few days (and in any event, we intend to respond to all such queries within 28 days of receipt).
      //     </p>
      //     <p class="leading-7">
      //     22.4. Disputes must be lodged within fourteen (14) days from the date the wager in question has been decided. No claims will be honored after this period. The Customer is solely responsible for their Account transactions.
      //     </p>
      //     <p class="leading-7">
      //     22.5. In the event of a dispute arising between you and us our Customer Service Department will attempt to reach an agreed solution. Should our Customer Service Department be unable to reach an agreed solution with you, the matter will be escalated to our management.
      //     </p>
      //   `,
    },
  },
  {
    id: "assignment",
    text: {
      title: t("termOfService:assignment.title"),
      content: t("termOfService:assignment.content"),
      open: false,
      //   content: `
      //   <p class="leading-7">
      //     Neither these Terms nor any of the rights or obligations hereunder may be assigned by you without the prior written consent of us, where consent will not be unreasonably withheld. We may, without your consent, assign all or any portion of our rights and obligations hereunder to any third party provided such third party is able to provide a service of substantially similar quality to the Service by posting written notice to this effect on the Service.
      //   </p>
      //   `
    },
  },
  {
    id: "severability",
    text: {
      title: t("termOfService:severability.title"),
      content: t("termOfService:severability.content"),
      open: false,
      //   content: `
      //   <p class="leading-7">
      //     In the event that any provision of these Terms is deemed by any competent authority to be unenforceable or invalid, the relevant provision shall be modified to allow it to be enforced in line with the intention of the original text to the fullest extent permitted by applicable law. The validity and enforceability of the remaining provisions of these Terms shall not be affected.
      //   </p>
      //     `,
    },
  },
  {
    id: "breachOfTheseTerms",
    text: {
      title: t("termOfService:breachOfTheseTerms.title"),
      content: t("termOfService:breachOfTheseTerms.content", {
        gameLink: gameLink,
      }),
      open: false,
      //   content: `
      //     <p class="leading-7">
      //     25.1. Without limiting our other remedies, we may suspend or terminate your Account and refuse to continue to provide you with the Service, in either case without giving you prior notice, if, in our reasonable opinion, you breach any material term of these Terms. Notice of any such action taken will, however, be promptly provided to you.
      //     </p>
      //     <p class="leading-7">
      //     25.2. You agree to fully indemnify, defend and hold harmless {{gameLink}} and its shareholders, directors, agents, and employees from and against all claims, demands, liabilities, damages, losses, costs, and expenses, including legal fees and any other charges whatsoever, howsoever caused, that may arise as a result of: (i) your breach of this Agreement, in whole or in part; (ii) violation by you of any law or any third party rights; and (iii) use by you of the Service.
      //     </p>
      //     `,
    },
  },
  {
    id: "generalProvisions",
    text: {
      title: t("termOfService:generalProvisions.title"),
      content: t("termOfService:generalProvisions.content", {
        gameLink: gameLink,
      }),
      open: false,
      //   content: `
      //   <p class="leading-7">
      //     26.1. <span class="text-base font-bold">Term of agreement.</span> These Terms shall remain in full force and effect while you access or use the Service or are a Customer or visitor of the Website. These Terms will survive the termination of your Account for any reason.
      //     </p>
      //     <p class="leading-7">
      //     26.2. <span class="text-base font-bold">Gender.</span> Words importing the singular number shall include the plural and vice versa, words importing the masculine gender shall include the feminine and neuter genders and vice versa and words importing persons shall include individuals, partnerships, associations, trusts, unincorporated organizations, and corporations.
      //     </p>
      //     <p class="leading-7">
      //     26.3. <span class="text-base font-bold">Waiver.</span> No waiver by us, whether by conduct or otherwise, of a breach or threatened breach by you of any term or condition of these Terms shall be effective against, or binding upon, us unless made in writing and duly signed by us, and, unless otherwise provided in the written waiver, shall be limited to the specific breach waived. The failure of us to enforce at any time any term or condition of these Terms shall not be construed to be a waiver of such provision or of the right of us to enforce such provision at any other time.
      //     </p>
      //     <p class="leading-7">
      //     26.4. <span class="text-base font-bold">Acknowledgement.</span> By hereafter accessing or using the Service, you acknowledge having read, understood, and agreed to each and every paragraph of these Terms. As a result, you hereby irrevocably waive any future argument, claim, demand, or proceeding to the contrary of anything contained in these Terms.
      //     </p>
      //     <p class="leading-7">
      //     26.5. <span class="text-base font-bold">Language.</span> In the event of there being a discrepancy between the English language version of these rules and any other language version, the English language version will be deemed to be correct.
      //     </p>
      //     <p class="leading-7">
      //     26.6. <span class="text-base font-bold">Governing Law.</span> These Terms are governed by the law in force in Curaçao; and you unconditionally and irrevocably submit the exclusive (sole) right of the courts of Curaçao jurisdiction to settle any dispute resolutions (including claims for compensation and counterclaims), that may arise because of the creation, validity, effect, interpretation or action, or legal relations established by the Terms or in any other manner arising from the Terms; and you irrevocably waive any right that it may have to object to an action being brought in those courts, or to claim that the action has been brought in an inconvenient forum, or that those courts do not have jurisdiction. Nothing in this clause shall limit the right of the {{gameLink}} Alliance to take proceedings against you in any other court of competent jurisdiction, nor shall the taking of proceedings in any one or more jurisdictions preclude the taking of proceedings in any other jurisdictions, whether concurrently or not, to the extent permitted by the law of such other jurisdiction.
      //     </p>
      //     <p class="leading-7">
      //     26.7. <span class="text-base font-bold">Entire agreement.</span> These Terms constitute the entire agreement between you and us with respect to your access to and use of the Service and supersede all other prior agreements and communications, whether oral or written with respect to the subject matter hereof.
      //     </p>
      // `,
    },
  },
];

export default function Index() {
  const { t } = useTranslation("termOfService");

  return (
    <div className={"flex flex-col gap-2"}>
      {content(t).map((item) => (
        <Container key={item.id} text={item.text} />
      ))}
    </div>
  );
}
