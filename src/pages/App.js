import React from "react";
import AddressFormatter from "../components/common/AddressFormatter";
import CampaignFactory from "../../ethereum/services/CampaignFactory";
import CampaignService from "../../ethereum/services/CampaignService";
import { Card, Icon } from "semantic-ui-react";
import styles from "./App.module.css";

class App extends React.Component {

    static async getInitialProps() {
        const campaignFactory = CampaignFactory.getCampingFactory();
        const campaigns = await campaignFactory.methods.getDeployedCampaigns().call();
        const summary = await CampaignService.getCampingsSummary(campaigns);
        
        return { campaigns: summary};
    }

    render() {
        const items = this.props.campaigns.map((campaign) => {
            return {
                header:  campaign.title,
                description:() => {
                    return (<div className={styles.campaignDescription}>
                        <AddressFormatter address={campaign.campaign._address}/>
                        <a className={styles.campaignDescriptionLink}
                            href={`/campaigns/${campaign.campaign._address}`} > 
                            <Icon className="campaignDescriptionIcon" name="eye"/>
                            <span>Campaign details</span>
                        </a>
                    </div>)
                },
                fluid: true
            }
        })
        return <Card.Group items={items}></Card.Group>
    }
}

export default App;