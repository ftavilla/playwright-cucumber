export interface UseCase<Input = any, Output = void> {
    execute(input: Input): Promise<Output>;
}