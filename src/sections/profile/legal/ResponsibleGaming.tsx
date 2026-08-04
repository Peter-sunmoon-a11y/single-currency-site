import { siteConfig } from "@/lib/env";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { Container } from "@/sections/profile/legal/Container.tsx";
import { TFunction } from "@/lib/i18n/i18next";

const buildAnchor = (href: string, label: string) =>
  `<a target="_blank" href="${href}" class="text-primary font-bold text-sm">${label}</a>`;

const gameLink = buildAnchor(siteConfig.url, siteConfig.nickname);
const responsibleGamingLinks = {
  gameLink,
  supportEmailLink: buildAnchor(`mailto:${siteConfig.supportEmail}`, siteConfig.supportEmail),
  anonymousLink: buildAnchor(siteConfig.responsibleGaming.anonymous, siteConfig.responsibleGaming.anonymous),
  therapyLink: buildAnchor(siteConfig.responsibleGaming.therapy, siteConfig.responsibleGaming.therapy),
  therapyEmailLink: buildAnchor(`mailto:${siteConfig.responsibleGaming.therapyEmail}`, siteConfig.responsibleGaming.therapyEmail),
  chatLink: buildAnchor(siteConfig.responsibleGaming.chat, siteConfig.responsibleGaming.chat),
  supportLink: buildAnchor(siteConfig.responsibleGaming.support, siteConfig.responsibleGaming.support),
  blocksLink: buildAnchor(siteConfig.responsibleGaming.blocks, siteConfig.responsibleGaming.blocks),
  netnannyLink: buildAnchor(siteConfig.responsibleGaming.netnanny, siteConfig.responsibleGaming.netnanny),
  gamblockLink: buildAnchor(siteConfig.responsibleGaming.gamblock, siteConfig.responsibleGaming.gamblock),
  tel: siteConfig.responsibleGaming.tel,
};

const content = (t: TFunction) => [
  {
    id: "responsibleGaming",
    text: {
      title: t("responsibleGaming:responsibleGaming.title"),
      content: t("responsibleGaming:responsibleGaming.content", {
        gameLink: responsibleGamingLinks.gameLink

      }),
      open: true
      // content: `
      //   <p class="leading-7">
      //       {{gameLink}} is dedicated to fostering responsible gambling practices to all customers on our platform and within our community. We are committed to ensuring that our customers are educated on our various responsible gambling tools available for use, promote gambling as a form of entertainment and empowering individuals to make informed decisions about their gambling activities.
      //   </p>
      //   <br />
      //   <p class="leading-7">
      //       6 Tips For Effective Management Of Your Gambling Activities
      //   </p>
      //   <ol class="pl-2 leading-7">
      //     <li><span class="">• </span> Effective management of your gambling activities can be done by prioritizing other recreational activities too</li>
      //     <li><span class="">• </span> Before a gambling session, have a plan in mind of how much you want to spend gambling, and how long you will be gambling for</li>
      //     <li><span class="">• </span> Do not spend more than what you can afford to lose</li>
      //     <li><span class="">• </span> Understanding the odds and knowing the risks associated with gambling</li>
      //     <li><span class="">• </span> Identify when you are no longer having fun or where gambling has become a problem for you, and stop</li>
      //     <li><span class="">• </span> Set loss limits, wager limits to assist with managing your gambling activities</li>
      //   </ol>
      // `,
    }
  },
  {
    id: "houseAdvantage",
    text: {
      title: t("responsibleGaming:houseAdvantage.title"),
      content: t("responsibleGaming:houseAdvantage.content", {
        gameLink: responsibleGamingLinks.gameLink

      }),
      open: false
      // content: `
      // <p class="leading-7">
      //   Games have a house edge to ensure a percentage of the total amount wagered is returned to the House, which in this case is {{gameLink}}.
      // </p>
      // `,
    }
  },
  {
    id: "randomness",
    text: {
      title: t("responsibleGaming:randomness.title"),
      content: t("responsibleGaming:randomness.content"),
      open: false
      //   content: `
      //   <p class="leading-7">
      //     All gambling has an element of randomness; there is no way to control the outcome of any casino game or sporting event.
      //   </p>
      //   `,
    }
  },
  {
    id: "independentOutcomes",
    text: {
      title: t("responsibleGaming:independentOutcomes.title"),
      content: t("responsibleGaming:independentOutcomes.content"),
      open: false
      //   content: `
      //   <p class="leading-7">
      //     Games/Spins are not related. Their outcomes are not dependent on how much, or how long, you’ve previously played the game for.
      //   </p>
      //   `,
    }
  },
  {
    id: "oddsAndProbability",
    text: {
      title: t("responsibleGaming:oddsAndProbability.title"),
      content: t("responsibleGaming:oddsAndProbability.content"),
      open: false
      //   content: `
      //   <p class="leading-7">
      //     Odds and probability are ways to describe your chances of winning. Whilst the odds can appear to be low, there are no certainties in betting.
      //   </p>
      //   `,
    }
  },
  {
    id: "introducingOurResponsibleGamblingTools",
    text: {
      title: t("responsibleGaming:introducingOurResponsibleGamblingTools.title"),
      content: t("responsibleGaming:introducingOurResponsibleGamblingTools.content", {
        gameLink: responsibleGamingLinks.gameLink,
        supportEmailLink: responsibleGamingLinks.supportEmailLink,
        anonymousLink: responsibleGamingLinks.anonymousLink,
        therapyLink: responsibleGamingLinks.therapyLink,
        therapyEmailLink: responsibleGamingLinks.therapyEmailLink,
        chatLink: responsibleGamingLinks.chatLink,
        supportLink: responsibleGamingLinks.supportLink,
        tel: responsibleGamingLinks.tel

      }),
      open: false
      //   content: `
      //     <p class="leading-7">
      //   Gambling should always be a form of entertainment. In order to assist you in keeping your gambling activities fun,
      //   {{gameLink}} has a range of responsible gambling tools which you are able to make use of at any point in time. Play
      //   for fun, not for funds.
      // </p>
      // <br />
      // <p class="text-lg leading-7 font-bold">Gambling Limits</p>
      // <br />
      // <p class="text-base leading-7 font-semibold">Loss limit</p>
      // <p class="leading-7">
      //   A loss limit allows you to set a limit on how much you can afford to lose over your set period of time. The limit
      //   can be set over a period of one day, one week or one month. It is a net loss limit. Profits made during your set
      //   period will not count towards your limit amount. If you are profitable during the set period, you are able to use
      //   your profits to continue to wager and bet until you reach your loss limit. Unsettled bets count towards the limit.
      //   Please check your unsettled bets if you are unable to place bets, as these unsettled bets may cause you to reach
      //   your limit.
      // </p>
      // <br />
      // <p class="text-base leading-7 font-semibold">Wager limit</p>
      // <p class="leading-7">
      //   A wager limit (or betting limit) allows you to set a limit on how much you can wager over your set period of time.
      //   The maximum bet limit can be set over a period of one day, one week or one month. The limit is not a net limit, so
      //   profits are excluded. This means, if you are profitable during the period, these profits are not offset against
      //   your maximum bet limit. Decreasing an existing limit is effective immediately. To increase your limits, your new
      //   limit will be subject to a 24-hour cool off period before your new limit takes effect.
      // </p>
      // <br />
      // <p class="text-base leading-7 font-semibold">Self-Exclusion</p>
      // <p class="leading-7">
      //   A self-exclusion tool offers the ability to suspend all access to your account should you feel that you are at
      //   risk of developing a gambling problem, or in some cases, believe you currently have one.
      // </p>
      // <br />
      // <p class="leading-7">The available periods are as follows:</p>

      // <ol class="pl-2 leading-7">
      //   <li><span class="">• </span> 6 Months</li>
      //   <li><span class="">• </span> 1 Year</li>
      //   <li><span class="">• </span> Indefinite</li>
      // </ol>

      // <p class="leading-7">
      //   In the event an indefinite exclusion is set, access to your account(s) will remain blocked until such a time
      //   should you actively request to revoke the indefinite exclusion. The indefinite exclusion imposes a minimum
      //   exclusion period of at least 6 months, from the date of application. Once the 6 month period has lapsed, your
      //   account can be considered for reactivation subject to a formal return to play review. In order to initiate the
      //   review process, please contact our support team via email.
      // </p>
      // <br />
      // <p class="text-base leading-7 font-semibold">Temporary Exclusion</p>
      // <p class="leading-7">
      //   {{gameLink}} also provides alternative options to suspend your account temporarily, known as temporary exclusion.
      //   Whether you would like to take a break from gambling to re-evaluate your personal goals, save some money or simply
      //   spend time on other activities, the option is made available to you.
      // </p>
      // <br />
      // <p class="leading-7">The available periods are as follows:</p>

      // <ol class="pl-2 leading-7">
      //   <li><span class="">• </span> 1 Day</li>
      //   <li><span class="">• </span> 1 Week</li>
      //   <li><span class="">• </span> 1 Month</li>
      //   <li><span class="">• </span> 3 Months</li>
      // </ol>
      // <br />
      // <p class="leading-7">
      //   Note: {{gameLink}} reserves the right to self-exclude a customers account should we determine that gambling may not be
      //   safe for you to continue.
      // </p>
      // <br />
      // <p class="text-base leading-7 font-semibold">Application of Temporary Exclusion or Self-Exclusion</p>

      // <ol class="list-decimal pl-4 leading-7">
      //   <li>
      //     <span class="font-medium"></span>
      //     Upon initial application, your account will enter into a 24 hour cooling off period
      //   </li>
      //   <li>
      //     <span class="font-medium"></span>
      //     Once the 24 hour cooling off period has lapsed, you will be presented with the applicable timeframes
      //   </li>
      //   <li>
      //     <span class="font-medium"></span>
      //     In the event no self-exclusion period is selected, your account will reopen automatically
      //   </li>
      //   <li>
      //     <span class="font-medium"></span>
      //     No further activity will be permitted once the exclusion has been applied and taken effect
      //   </li>
      //   <li>
      //     <span class="font-medium"></span>
      //     It will not be possible to reactivate your account until the chosen time period has lapsed
      //   </li>
      //   <li>
      //     <span class="font-medium"></span>
      //     Where a defined self-exclusion is in effect, your account will automatically reactivate once the chosen time
      //     period has lapsed
      //   </li>
      //   <li>
      //     <span class="font-medium"></span>
      //     Where an indefinite self-exclusion is in effect, whether applied by the client or operator, a minimum of 6
      //     months must pass before the account can be considered for review
      //   </li>
      // </ol>
      // <br />
      // <p class="text-base leading-7 font-semibold">Closing My {{gameLink}} Account</p>
      // <p class="leading-7">
      //   {{gameLink}} provides the option to close your account should you wish. An individual may opt to close their account
      //   for different reasons, perhaps does not find gambling entertaining anymore, or for any other personal reasons
      //   unrelated to problem gambling.
      // </p>
      // <p class="leading-7">
      //   To close your account, a request must be made to our Customer Support Team via chat or email which is
      //   {{supportEmailLink}}
      // </p>
      // <p class="leading-7">
      //   It is important to note that once your account has been closed, {{gameLink}} will prohibit you from:
      // </p>
      // <ol class="pl-2 leading-7">
      //   <li><span class="">• </span>Accessing your account</li>
      //   <li><span class="">• </span>Receiving any further bonuses or promotional material</li>
      // </ol>
      // <br />
      // <p class="text-base leading-7 font-semibold">Reactivating Your Closed Account</p>
      // <p class="leading-7">
      //   In the event you wish to reactivate your account, a formal written request needs to be made via chat or email
      //   service ({{supportEmailLink}}) for the account to be reactivated. A minimum cool off period of 24 hours must lapse
      //   from the time the account was closed, before your account may be considered for reopening. In some instances,
      //   {{gameLink}} may, at our discretion, conduct internal checks prior to making a decision to reopen an account.
      // </p>
      // <p class="leading-7">
      //   Note: {{gameLink}} reserves the right to close a customers account at any point in time, at our sole discretion.
      // </p>
      // <br />
      // <p class="text-base leading-7 font-semibold">Help Organizations</p>
      // <p class="leading-7">
      //   If you are worried about yourself, or if someone you know is having problems managing their gambling, there are
      //   several external support agencies that can assist with providing advice.
      // </p>
      // <br />
      // <p class="text-base leading-7 font-semibold">Gamblers Anonymous</p>
      // <p class="leading-7">Website: {{anonymousLink}}</p>
      // <br />
      // <p class="text-base leading-7 font-semibold">Gambling Therapy</p>
      // <p class="leading-7">Website: {{therapyLink}}</p>
      // <p class="leading-7">Contact: {{therapyEmailLink}}</p>
      // <br />
      // <p class="text-base leading-7 font-semibold">The National Council on Problem Gambling</p>
      // <p class="leading-7">
      //   The National Council on Problem Gambling provides a range of resources, including answers to commonly asked
      //   questions, a gambling behavior self-assessment, information about treatment and the National Problem Gambling
      //   Helpline (1-800-GAMBLER) to connect you with help in your state (Canada).
      // </p>

      // <p class="leading-7">Tel: <span class="text-primary font-bold text-sm">+18004262537</span></p>
      // <p class="leading-7">Chat: {{chatLink}}</p>
      // <br />
      // <p class="text-base leading-7 font-semibold">Gamtalk</p>
      // <p class="leading-7">
      //   Gamtalk provides information on helplines, treatment and online resources from organizations around the world
      //   dedicated to helping those struggling with problem gambling.
      // </p>
      // <p class="leading-7">Website: {{supportLink}}</p>
      //     `,
    }
  },
  {
    id: "minors",
    text: {
      title: t("responsibleGaming:minors.title"),
      content: t("responsibleGaming:minors.content", {
        gameLink: responsibleGamingLinks.gameLink,

        minorsAge: 18,
        blocksLink: responsibleGamingLinks.blocksLink,
        netnannyLink: responsibleGamingLinks.netnannyLink,
        gamblockLink: responsibleGamingLinks.gamblockLink
      }),
      open: false
      //       content: `
      //       <p class="leading-7">
      //           {{gameLink}} does not support underage gambling.
      //       </p>
      //       <p class="leading-7">
      //           Underage gambling is illegal, and is defined as anyone who is under the age of {{minorsAge}} years old at the time of account registration.
      //       </p>
      //       <p class="leading-7">
      //           No winnings should be paid to such players if identified as someone who is underage.
      //       </p>
      //       <br />
      // <p class="text-base leading-7 font-semibold">
      //       Tips for Parents
      //       </p>

      //       <ol class="pl-2 leading-7">
      //         <li><span class="">• </span>Do not leave your computer unattended when your casino software is running.</li>
      //         <li><span class="">• </span>Password-protect your casino program.</li>
      //         <li><span class="">• </span>Do not allow minors to participate in any gambling activity.</li>
      //         <li><span class="">• </span>Keep your casino account number and payment card(s) out of reach of minors.</li>
      //         <li><span class="">• </span>Do not save passwords onto your computer.</li>
      //        <li><span class="">• </span>Limit the amount of time your children spend online and make use of software to prevent your children from accessing inappropriate material.</li>
      //     </ol>
      //     <br />
      // <p class="text-base leading-7 font-semibold">
      // Gambling Blocks
      // </p>
      // <p class="leading-7">
      // There are gambling site blocker apps available to help restrict access to gambling websites as a protective measure of safeguarding yourself, or in some instances, safeguarding the risk of gambling exposure to a minor. Betblocker
      // </p>
      // <p class="leading-7">
      // {{blocksLink}}
      // </p>
      // <br />
      // <p class="text-base leading-7  ">
      // Netnanny:
      // </p>
      // <p class="leading-7">
      // Netnanny offers protective measures which vary from website and app blocks to parental controls.
      // </p>
      // <p class="leading-7">
      // Website: {{netnannyLink}}
      // </p>
      // <br />
      // <p class="text-base leading-7  ">
      // Gamblock:
      // </p>
      // <p class="leading-7">
      // Gamblock is a mobile app that blocks access to thousands of gambling websites and provides access to useful resources.
      // </p>
      // <p class="leading-7">
      // Website: {{gamblockLink}}
      // </p>
      // <br />
      // <p class="leading-7">
      // *{{gameLink}} Alliance does not accept any liability in respect of any third-party software.
      // </p>
      // `,
    }
  }
];

export default function Index() {
  const { t } = useTranslation('responsibleGaming');

  return (
    <div className={'flex flex-col gap-2'}>
      {content(t).map((item) => (
        <Container key={item.id} text={item.text} />
      ))}
    </div>
  );
}
