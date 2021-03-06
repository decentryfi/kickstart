import "./AppNavbar.scss";
import React from "react";
import { Dropdown, Icon, Navbar } from "react-materialize";
import { NavLink } from "react-router-dom";
import BlockchainService from "../../services/BlockchainService";
import IBlockchain from "../../models/IBlockchain";
import logo from "../../assets/img/logo.png";
import Web3Service from "../../services/Web3Service";
import M from "materialize-css";
import LoaderService from "../../services/LoaderService";
import AddressFormatter from "../Address/AddressFormatter";
import { Subscription } from "rxjs";

class AppNavbar extends React.Component {

	accountSubscription?: Subscription;
	chainSubscription?: Subscription;
	state = {
		selectedBlockchain: {
			name: "",
			url: "",
			contractExplorer: "",
			contractAddress: "",
			currency: "",
			chainId: "",
			icon: ""
		},
		account: ""
	};

	componentDidMount = () => {
		this.accountSubscription = Web3Service.account.subscribe((account) => {
			this.setState({ account });
		});

		this.chainSubscription = Web3Service.chain.subscribe((chainId) => {
			this.setState({
				selectedBlockchain: BlockchainService.selected
			});
		});
	};

	componentWillUnmount = () => {
		this.accountSubscription?.unsubscribe();
		this.chainSubscription?.unsubscribe();
	};

	getContractExplorerUrl = () => {
		const contractExplorer = this.state.selectedBlockchain.contractExplorer;

		return contractExplorer + "address/" + this.state.selectedBlockchain.contractAddress;
	};

	onSelectBlockchain = async (blockchain: IBlockchain) => {
		const { selected, chainId } = blockchain;
		if (selected) return;

		const switchedSuccessfully = await Web3Service.switchNetwork(chainId);
		if(switchedSuccessfully){
			try{
				BlockchainService.select(chainId);
				window.location.reload();
			}
			catch(err){
				console.log(err)
				const { message } = err as Error;
				M.toast({html: message});
			}
		}
	};

	onConnect = async () => {
		LoaderService.loading(true);
		try {
			await Web3Service.connectMetamask(true);
		} catch (err) {
			const { message } = err as Error;
			M.toast({ html: message });
		}
		LoaderService.loading(false);
	};

	onToggleDropdownClass = () => {
		// Todo toggle dropdown class
		document.getElementById("change-network-dropdown")?.classList.toggle("visible");
	};

	renderBrand = () => {
		return (
			<NavLink to="/">
				<img src={logo} />
				<h5>Kickstart</h5>
			</NavLink>
		);
	};

	renderAvailableBlockchains = () => {
		return BlockchainService.blockchains
			.filter((blockchain) => blockchain.contractAddress)
			.map((blockchain, index) => {
				return (
					<a
						className={blockchain.selected ? "selected" : ""}
						onClick={() => this.onSelectBlockchain(blockchain)}
						key={index}
					>
						<div className={`network-logo ${blockchain.icon}`} />
						<span>{blockchain.name}</span>
					</a>
				);
			});
	};

	render = () => {
		return (
			<Navbar alignLinks="right" brand={this.renderBrand()} menuIcon={<Icon>menu</Icon>}>
				<NavLink to="/">
					<Icon>list</Icon>
					<span>Campaigns</span>
				</NavLink>
				<NavLink to="/campaigns/new">
					<Icon>add</Icon>
					<span>New Campaign</span>
				</NavLink>
				{this.state.account ? (
					<a>
						<Icon>account_balance_wallet</Icon>
						<AddressFormatter maxWidth="92.46px" address={this.state.account} />
					</a>
				) : (
					<a onClick={() => this.onConnect()}>
						<Icon>account_balance_wallet</Icon>
						<span>Connect</span>
					</a>
				)}
				<Dropdown
					id="change-network-dropdown"
					options={{
						constrainWidth: false,
						coverTrigger: false,
						onOpenStart: this.onToggleDropdownClass,
						onCloseStart: this.onToggleDropdownClass,
						inDuration: 120,
						outDuration: 120
					}}
					trigger={
						<a>
							<Icon>keyboard_arrow_down</Icon>
							<span className="networks-wording">Network&nbsp;</span>
							<span>{this.state.selectedBlockchain.name}</span>
						</a>
					}
				>
					{this.renderAvailableBlockchains()}
				</Dropdown>
				<Dropdown
					id="more-options-dropdown"
					options={{
						constrainWidth: false,
						coverTrigger: false,
						inDuration: 120,
						outDuration: 120
					}}
					trigger={
						<a>
							<Icon>more_vert</Icon>
						</a>
					}
				>
					<a href="https://github.com/decentryfi/kickstart" target="_blank" rel="noreferrer">
						<Icon>code</Icon>
						<span>Contract source code</span>
					</a>
					<a href={this.getContractExplorerUrl()} target="_blank" rel="noreferrer">
						<Icon>description</Icon>
						<span>Deployed contract</span>
					</a>
				</Dropdown>
			</Navbar>
		);
	};
}

export default AppNavbar;
