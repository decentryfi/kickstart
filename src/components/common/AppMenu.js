import React from "react";
import { Button, Icon, Menu } from "semantic-ui-react";
import CampaignFactory from "../../../ethereum/services/CampaignFactory";

class AppMenu extends React.Component {

    render() {
        return (
        <div style={{marginBottom: "1em"}}>
            <Menu>
                <Menu.Menu position="left">
                    <a className="item" href="/">DecentryFi Kickstart</a>
                </Menu.Menu>

                <Menu.Menu position="right">
                    <a className="item" href="/">
                        <Icon name="list"/>
                        Campaigns
                    </a>
                    <a className="item" href="/campaign">
                        <Icon name="plus"/>
                        Campaign
                    </a>
                    <a className="item" href="https://github.com/decentryfi/kickstart" target="_blank">
                        <Icon name="github"/>
                        Source
                    </a>
                    <a className="item" href={`https://rinkeby.etherscan.io/address/${CampaignFactory.address}`} target="_blank">
                        <Icon name="ethereum"/>
                        Contract
                    </a>
                </Menu.Menu>
            </Menu>

            <Menu borderless={true}
                style={{ border: "none", boxShadow: "none" }}>
                <Menu.Menu position="left"
                    style={{display: "flex", alignItems: "center"}}>
                        {(
                            this.props.backRoute ? 
                                <a href={this.props.backRoute}>
                                    <Icon style={{ marginBottom: "2px", cursor: "pointer"}} name="arrow left"></Icon>
                                </a> : null
                        )}
                    <h3 style={{marginTop: 0, marginLeft: "0.5em"}}>{this.props.pageTitle}</h3>
                </Menu.Menu>

                {(
                    this.props.nextRoute ?                 
                    <Menu.Menu position="right">
                        <a href={this.props.nextRoute}>
                            <Button primary fluid >
                                <Icon name={this.props.nextRouteIcon}/>
                                {this.props.nextRouteDescription}
                            </Button>
                        </a>
                    </Menu.Menu> : null
                )}
            </Menu>
        </div>
        );
    }
}

export default AppMenu;