import { Page } from '@playwright/test';
import { IWorldOptions, setWorldConstructor, World } from '@cucumber/cucumber';
import { UseCase } from '../domain/usecases/UseCase';
import { getVaultService } from '../infrastructure/vault/VaultService';

export class CustomWorld extends World {
    page!: Page;
    useCases: Map<Symbol, UseCase> = new Map();

    constructor(options: IWorldOptions) {
        super(options);
    }

    setUseCase<T extends UseCase<any, any>>(key: Symbol, useCase: T): void {
        this.useCases.set(key, useCase);
    }

    getUseCase<T extends UseCase<any, any>>(key: Symbol): T {
        const useCase = this.useCases.get(key);
        if (!useCase) {
            throw new Error(`UseCase with key "${key}" not found`);
        }
        return useCase as T;
    }

    /**
     * Retrieves credentials directly from Vault without storing them in memory
     * @param userId - The user identifier to fetch credentials for
     * @returns The user credentials from Vault
     */
    async getCredentialsFromVault(userId: string) {
        const vaultService = getVaultService();
        if (!vaultService.isConnected()) {
            await vaultService.initialize();
        }
        return await vaultService.getTestUserCredentials(userId);
    }
}

setWorldConstructor(CustomWorld);
