import defaultChains from "../blockchains.json";
import IBlockchain from "../models/IBlockchain";
import LocalStorageService from "./LocalStorageService";
import * as _ from "lodash";

class BlockchainService {

	static get blockchains(): Array<IBlockchain> {
		const storageChains = LocalStorageService.get().blockchains;

		// If local storage is not used get all 
		// blockchains from config file
		if(_.isEmpty(storageChains)){
			LocalStorageService.setItem("blockchains", defaultChains);
			return defaultChains as Array<IBlockchain>;
		}

		// Validate if all chains from local storage are up to date
		// and delete the chains that are not existing anymore
		// FIX: if there are more chains on the json file than 
		// loclastorage they will never be displayed
		const updatedChains = _.chain(storageChains) 
			.map((storageChain) => {
				const newChain = _.find(defaultChains, (defaultChain : IBlockchain) => {
					const isSameChain = storageChain.chainId === defaultChain.chainId;
					const isOutdated = storageChain.version < defaultChain.version;

					return isSameChain && isOutdated;
				});

				return _.isUndefined(newChain) ? storageChain : newChain;
			})
			.filter((newChain) => {
				return _.find(defaultChains, (defaultChain) => newChain.chainId === defaultChain.chainId);
			})
			.value();
		
		// Find if there is still a selected chain
		const selectedChain = _.find(updatedChains, chain => chain.selected);

		// If there is no selected chain use the first option
		if(_.isUndefined(selectedChain)){
			updatedChains[0].selected = true;
		}

		LocalStorageService.setItem("blockchains", updatedChains);

		return updatedChains;
	}

	static select(chainId : string) {
		const chains = _.map(BlockchainService.blockchains, (blockchain) =>{
			delete blockchain.selected
			return blockchain;
		});

		// TODO Throw expection if chain does not exist ? 
		const chain = _.find(chains, blockchain => blockchain.chainId == chainId) as IBlockchain;
		chain.selected = true;
		
		LocalStorageService.setItem("blockchains", chains);
	}

	static get selected(): IBlockchain {
		const storage = LocalStorageService.get();

		if(_.isEmpty(storage.blockchains)){
			return _.find(BlockchainService.blockchains,blockchain => blockchain.selected) as IBlockchain;
		}

		return _.find(storage.blockchains, (blockchain: IBlockchain) => blockchain.selected);
	}

	static get selectedAddress() {
		return BlockchainService.selected.contractAddress;
	}
}

export default BlockchainService;
