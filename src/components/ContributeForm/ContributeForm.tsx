import "./ContributeForm.scss";
import React, { FormEvent } from "react";
import { Button, CardPanel, TextInput } from "react-materialize";
import BlockchainService from "../../services/BlockchainService";
import Web3Service from "../../services/Web3Service";
import _ from "lodash";
import CampaignService from "../../services/CampaignService";
import LoaderService from "../../services/LoaderService";
import { Subscription } from "rxjs";

type Props = {
	minimumContribution: string;
	campaignAddress: string;
	onContributeSuccessfully: Function;
};

export default class ContributeForm extends React.Component<Props> {

	accountSubscription?: Subscription;
	state = {
		contribution: "0",
		account: "",
		errorMessage: ""
	};

	componentDidMount = async () => {
		this.accountSubscription = Web3Service.account.subscribe((account) => {
			this.setState({ account });
		});
	};

	componentWillUnmount = () => {
		this.accountSubscription?.unsubscribe();
	};

	onSubmit = async (event: FormEvent) => {
		event.preventDefault();
		LoaderService.loading(true);
		try {
			await CampaignService.contributeToCampaign(this.props.campaignAddress, this.state.contribution);
		} catch (err) {
			const { message } = err as Error;
			M.toast({ html: message });
		}
		await this.props.onContributeSuccessfully();
		LoaderService.loading(false);
	};

	onTextInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		event.preventDefault();
		const { utils } = Web3Service.provider;
		const { value } = event.target;
		const { minimumContribution } = this.props;
		const parsedMinimumContribution = utils.fromWei(minimumContribution, "ether");
		const parsedValue = parseFloat(value);

		this.setState({ contribution: value });

		if (_.isNaN(parsedValue) || _.lte(parsedValue, 0)) {
			return this.setState({
				errorMessage: `Contribution needs to be a number greater than 
				${parsedMinimumContribution} ${BlockchainService.selected.currency}`
			});
		}

		const parsedValueToWeb3 = utils.toWei(event.target.value ? event.target.value : "0", "ether");

		if (_.lte(parsedValueToWeb3, parseFloat(minimumContribution))) {
			this.setState({
				errorMessage: `Contribution needs to be a number greater than
				${parsedMinimumContribution} ${BlockchainService.selected.currency}`
			});
		} else this.setState({ errorMessage: "" });
	};

	render = () => {
		return (
			<form className="contribute-forms" onSubmit={this.onSubmit}>
				<TextInput
					id="contribution"
					disabled={!this.state.account}
					value={this.state.contribution}
					label={`Contribution (in ${BlockchainService.selected.currency})`}
					inputClassName={`hide-scrollbar ${this.state.errorMessage ? "invalid" : ""}`}
					onChange={this.onTextInputChange}
				/>
				<CardPanel
					className="error-panel"
					style={{
						display: this.state.errorMessage ? "block" : "none"
					}}
				>
					{this.state.errorMessage}
				</CardPanel>
				<Button disabled={!!this.state.errorMessage}>
					<i className="material-icons">add</i>
					Contribute
				</Button>
			</form>
		);
	};
}
