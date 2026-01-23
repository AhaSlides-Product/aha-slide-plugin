import { Page } from "@playwright/test";


export class goToPresentationById {
    static async goToPresentationById(page: Page, presentationId: number) {
        await page.goto(`https://presenter.dev.ahaslide.com/presentation/${presentationId}`);
    }
}