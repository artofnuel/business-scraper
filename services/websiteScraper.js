import axios from 'axios';
import * as cheerio from 'cheerio';
import pLimit from 'p-limit';
import { extractContactInfo, pickBestEmail } from './emailExtractor';
import { domainEmailSweep } from './domainEmailSweep';

const limit = pLimit(5); // max 5 concurrent requests
const DELAY_MS = 2000;

export async function scrapeWebsites(leads) {
    const scrapePromises = leads.map(lead =>
        limit(async () => {
            // Small artificial delay to avoid hammering servers too hard
            await new Promise(resolve => setTimeout(resolve, DELAY_MS));

            try {
                if (!lead.website || lead.website === 'N/A') return lead;

                let url = lead.website;
                if (!url.startsWith('http')) {
                    url = `http://${url}`;
                }

                // 1. Visit Homepage
                const response = await axios.get(url, {
                    timeout: 8000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
                    },
                    maxRedirects: 3
                });

                const html = response.data;
                const $ = cheerio.load(html);

                let { emails, phones } = extractContactInfo(html);
                let emailSource = '';

                // 2. Scrape Meta Description
                const desc = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || '';
                lead.description = desc ? desc.substring(0, 150) : '';

                // 3. If homepage email found → mark source
                if (emails.length > 0) {
                    emailSource = 'homepage';
                } else {
                    // 4. Fallback: Scrape Contact / About pages
                    const links = new Set();
                    $('a').each((i, el) => {
                        const href = $(el).attr('href');
                        if (href) {
                            const lowerHref = href.toLowerCase();
                            if (
                                lowerHref.includes('contact') ||
                                lowerHref.includes('about') ||
                                lowerHref.includes('support') ||
                                lowerHref.includes('help')
                            ) {
                                if (href.startsWith('http')) links.add(href);
                                else if (href.startsWith('/')) links.add(new URL(href, url).href);
                            }
                            // Also capture mailto: links from homepage
                            if (lowerHref.startsWith('mailto:')) {
                                const mail = lowerHref.replace('mailto:', '').split('?')[0];
                                if (mail.includes('@')) emails.push(mail);
                            }
                        }
                    });

                    // Try max 2 contact links
                    const linksArray = Array.from(links).slice(0, 2);
                    for (const link of linksArray) {
                        try {
                            const contactRes = await axios.get(link, {
                                timeout: 5000,
                                headers: { 'User-Agent': 'Mozilla/5.0' }
                            });
                            const contactData = extractContactInfo(contactRes.data);
                            emails = emails.concat(contactData.emails);
                            phones = phones.concat(contactData.phones);
                        } catch (err) {
                            // ignore contact page errors
                        }
                    }

                    if (emails.length > 0) {
                        emailSource = 'contact-page';
                    } else {
                        // 5. Domain Email Sweep fallback (DNS MX verified)
                        const sweepEmails = await domainEmailSweep(url);
                        if (sweepEmails.length > 0) {
                            emails = sweepEmails;
                            emailSource = 'domain-pattern';
                        }
                    }
                }

                // 6. Update Lead Object
                emails = Array.from(new Set(emails));
                phones = Array.from(new Set(phones));

                if (!lead.email && emails.length > 0) {
                    lead.email = pickBestEmail(emails);
                    lead.emailSource = emailSource;
                }

                if ((!lead.phone || lead.phone === 'N/A') && phones.length > 0) {
                    lead.phone = phones[0];
                }

            } catch (err) {
                console.warn(`Failed to scrape ${lead.website}: ${err.message}`);
            }
            return lead;
        })
    );

    return Promise.all(scrapePromises);
}
