import _ from "lodash";
import React, { BaseSyntheticEvent, FormEvent } from "react";
import { Button, Card, CardPanel, Col, Icon, Row, Textarea, TextInput } from "react-materialize";
import { useNavigate, NavigateFunction } from "react-router-dom";
import { Subscription } from "rxjs";
import PageHeader from "../../../components/PageHeader/PageHeader";
import BlockchainService from "../../../services/BlockchainService";
import CampaignFactory from "../../../services/CampaignFactory";
import LoaderService from "../../../services/LoaderService";
import Web3Service from "../../../services/Web3Service";
import "./NewCampaign.scss";

type Props = {
	navigate: NavigateFunction;
};

function NewCampaign() {
	const navigate = useNavigate();

	return <NewCampaignComponent navigate={navigate} />;
}

class NewCampaignComponent extends React.Component<Props> {

	accountSubscription?: Subscription;
	state = {
		title: {
			value: "",
			errorMessage: "",
			isValid: false
		},
		minimumContribution: {
			value: "",
			errorMessage: "",
			isValid: false
		},
		errorMessage: "",
		account: ""
	};

	componentDidMount = () => {
		this.accountSubscription = Web3Service.account.subscribe((account) => {
			this.setState({ account });
		});
	};

	componentWillUnmount = () => {
		this.accountSubscription?.unsubscribe();
	};

	validateForm = (event: BaseSyntheticEvent) => {
		event.preventDefault();
		const {
			id,
			value
		}: {
			id: "title" | "minimumContribution";
			value: string | number;
		} = event.target;
		let errorMessage = "";

		switch (id) {
			case "title":
				if (!value) {
					errorMessage = "Write a title for your campaign";
				} else if ((value as string).length > 80) {
					errorMessage = "Campaign title should not be longer than 80 characters";
				} else errorMessage = "";
				break;
			case "minimumContribution":
				if (!value) {
					errorMessage = "Minimum contribution cannot be empty";
				} else if (!_.gt(value, 0)) {
					errorMessage = "Minimum contribution needs to be a positive number";
				} else errorMessage = "";
				break;
		}

		this.setState({
			[id]: {
				value,
				errorMessage,
				isValid: _.isEmpty(errorMessage)
			},
			errorMessage
		});
	};

	onSubmit = async (event: FormEvent) => {
		event.preventDefault();
		LoaderService.loading(true);
		try {
			await CampaignFactory.createCamping(this.state.minimumContribution.value, this.state.title.value);
			this.props.navigate("/");
		} catch (err) {
			const { message } = err as Error;
			M.toast({ html: message });
			LoaderService.loading(false);
		}
	};

	render = () => {
		return (
			<div className="new-campaign">
				<PageHeader backToUrl="/"
					backTitle="New Campaign" />
				<Card>
					<Row>
						<Col l={8} m={6} s={12}>
							<form className="campaign-form" onSubmit={this.onSubmit} onChange={this.validateForm}>
								<Textarea
									id="title"
									disabled={!this.state.account}
									label="* Title"
									data-length={80}
									className={`${this.state.title.errorMessage ? "invalid" : ""}`}
								/>
								<CardPanel
									className="error-panel"
									style={{
										display: this.state.title.errorMessage ? "block" : "none"
									}}
								>
									{this.state.title.errorMessage}
								</CardPanel>
								<TextInput
									id="minimumContribution"
									disabled={!this.state.account}
									label={`* Minimum contribution (in ${BlockchainService.selected.currency})`}
									inputClassName={`hide-scrollbar 
										${this.state.minimumContribution.errorMessage ? "invalid" : ""}`}
								/>
								<CardPanel
									className="error-panel"
									style={{
										display: this.state.minimumContribution.errorMessage ? "block" : "none"
									}}
								>
									{this.state.minimumContribution.errorMessage}
								</CardPanel>
								<Col className="form-footer">
									<Button disabled=
										{!this.state.minimumContribution.isValid || !this.state.title.isValid}>
										<Icon>add</Icon>
										<span>Create</span>
									</Button>
								</Col>
							</form>
						</Col>

						<Col l={4} m={6} s={12}>
							<ul className="info-list">
								<li>
									To create a new campaign install and connect your
									<a href="https://metamask.io/download.html" rel="noreferrer" target="_blank">
										{" "}
										Metamask wallet
									</a>
									.
								</li>

								<li>Everyone can create as many campaigns as needed.</li>

								<li>
									When a campaign is created the address used to connect is assigned as manager to the
									campaign.
								</li>

								<li>
									The manager can create spending requests which needs to be approved 
									by at least 50% of contributors in order to be executed by the manager.
								</li>

								<li>Introduce a campaign title and a minimum accepted transaction contribution</li>
							</ul>
						</Col>
					</Row>
				</Card>
			</div>
		);
	};
}

export default NewCampaign;
