import { Page } from "@playwright/test";

/**
 * Authentication helper for E2E tests
 * 
 * Logs in to AhaSlides using a token to save time during testing.
 * This bypasses the normal login flow for faster test execution.
 */
export class AuthHelper {
    static async addTokenToCookies(page: Page) {
        //token of user qa.ahaslides+2@gmail.com | 123123123
        const token ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTYzNSwiaWF0IjoxNzY3NjY3MTY2LCJleHAiOjE4MzA3MzkxNjZ9.BmHKiSpn8oGaCN4jwyiT1KIQZezRut03Mc3_XVqc66g';
        await page.context().addCookies([
            {
                name: 'ahaToken',
                value: token,
                domain: '.ahaslide.com',
                path: '/',
                secure: true,
                sameSite: 'None',
            },
        ]);
    }
}
