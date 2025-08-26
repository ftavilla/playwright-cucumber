import { Page } from '@playwright/test';
import { IWorldOptions, setWorldConstructor, World } from '@cucumber/cucumber';
import { UseCase } from '../domain/usecases/UseCase';

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
}

setWorldConstructor(CustomWorld);
