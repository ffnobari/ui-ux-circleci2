const { test, expect } = require('@playwright/test');

test('home page has Turkish content and a clear shopping action', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle('AraBulAl - React E-Ticaret');
  await expect(page.locator('html')).toHaveAttribute('lang', 'tr');
  await expect(page.getByRole('main')).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Yeni Sezon Ürünlerini Keşfedin' })
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Alışverişe Başla' })).toBeVisible();
  await page.getByRole('button', { name: 'Alışverişe Başla' }).click();
  await expect(page.getByRole('heading', { name: 'Tüm Ürünler' })).toBeVisible();
});

test('category filters show only matching products', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Ürünler' }).click();
  await page.getByRole('button', { name: 'Aksesuar' }).click();

  await expect(page.getByRole('heading', { name: 'Minimalist Sırt Çantası' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Akıllı Saat' })).toHaveCount(0);
});

test('cart updates quantities and totals, then supports removal', async ({ page }) => {
  await page.goto('/');
  const addToCartButton = page.getByRole('button', { name: 'Sepete Ekle', exact: true }).first();
  await addToCartButton.click();
  await addToCartButton.click();
  await page.getByRole('button', { name: /^🛒 Sepet/ }).click();

  await expect(page.getByRole('heading', { name: 'Alışveriş Sepetim' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Kablosuz Kulaklık', exact: true })).toBeVisible();
  await expect(page.getByText('Adet: 2')).toBeVisible();
  const summary = page.getByRole('heading', { name: 'Sipariş Özeti' }).locator('..');
  await expect(summary.getByText('₺2500', { exact: true })).toHaveCount(2);

  await page.getByRole('button', { name: 'Kaldır' }).click();
  await expect(page.getByText('Sepetinizde henüz ürün bulunmuyor.')).toBeVisible();
});

for (const [category, names] of [
  ['Elektronik', ['Kablosuz Kulaklık', 'Akıllı Saat', 'Uzaktan Kumandalı Araba']],
  ['Aksesuar', ['Minimalist Sırt Çantası']],
  ['Yaşam', ['Termos Matara']],
]) {
  test(`${category} filter and reset show the correct products`, async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Ürünler', exact: true }).click();
    const filter = page.getByRole('button', { name: category, exact: true });
    await filter.click();
    await expect(filter).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('heading', { level: 4 })).toHaveText(names);
    await page.getByRole('button', { name: 'Tümü', exact: true }).click();
    await expect(page.getByRole('heading', { level: 4 })).toHaveCount(5);
    await expect(filter).toHaveAttribute('aria-pressed', 'false');
  });
}

test('empty cart provides a working way back to shopping', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /^🛒 Sepet/ }).click();
  await expect(page.getByText('Sepetinizde henüz ürün bulunmuyor.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Siparişi Tamamla' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Ürünlere Göz At' }).click();
  await expect(page.getByRole('heading', { name: 'Tüm Ürünler' })).toBeVisible();
});

test('mixed cart recalculates its total and count after removing one product', async ({ page }) => {
  await page.goto('/');
  const addButtons = page.getByRole('button', { name: 'Sepete Ekle', exact: true });
  await addButtons.nth(0).click();
  await addButtons.nth(0).click();
  await addButtons.nth(1).click();
  const cartButton = page.getByRole('button', { name: /^🛒 Sepet/ });
  await expect(cartButton).toHaveText(/Sepet\s*3/);
  await cartButton.click();
  const summary = page.getByRole('heading', { name: 'Sipariş Özeti' }).locator('..');
  await expect(summary.getByText('₺4900', { exact: true })).toHaveCount(2);
  const headphoneRow = page.getByRole('heading', { name: 'Kablosuz Kulaklık', exact: true })
    .locator('..').locator('..').locator('..');
  await headphoneRow.getByRole('button', { name: 'Kaldır', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Kablosuz Kulaklık', exact: true })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Akıllı Saat', exact: true })).toBeVisible();
  await expect(summary.getByText('₺2400', { exact: true })).toHaveCount(2);
  await expect(cartButton).toHaveText(/Sepet\s*1/);
});

test('checkout displays the demo order confirmation', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Sepete Ekle', exact: true }).first().click();
  await page.getByRole('button', { name: /^🛒 Sepet/ }).click();
  const confirmation = page.waitForEvent('dialog');
  const checkout = page.getByRole('button', { name: 'Siparişi Tamamla' }).click();
  const dialog = await confirmation;
  expect(dialog.type()).toBe('alert');
  expect(dialog.message()).toBe('Siparişiniz başarıyla alındı!');
  await dialog.accept();
  await checkout;
});

test('shopping works with the keyboard and announces cart changes', async ({ page }) => {
  await page.goto('/');
  async function tabTo(target) {
    for (let attempt = 0; attempt < 20; attempt += 1) {
      await page.keyboard.press('Tab');
      if (await target.evaluate(element => element === document.activeElement)) break;
    }
    await expect(target).toBeFocused();
  }
  const brand = page.getByRole('button', { name: 'Sistem Analizi ve Tasarımı Projesi' });
  await tabTo(brand);
  await tabTo(page.getByRole('button', { name: 'Ürünler', exact: true }));
  await page.keyboard.press('Enter');
  const accessories = page.getByRole('button', { name: 'Aksesuar', exact: true });
  await tabTo(accessories);
  await page.keyboard.press('Space');
  await expect(accessories).toHaveAttribute('aria-pressed', 'true');
  await tabTo(page.getByRole('button', { name: 'Sepete Ekle', exact: true }));
  await page.keyboard.press('Enter');
  await expect(page.getByRole('status')).toHaveText('Minimalist Sırt Çantası sepete eklendi.');
  await tabTo(page.getByRole('button', { name: /^🛒 Sepet/ }));
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Alışveriş Sepetim' })).toBeVisible();
  await tabTo(page.getByRole('button', { name: 'Kaldır', exact: true }));
  await page.keyboard.press('Enter');
  await expect(page.getByText('Sepetinizde henüz ürün bulunmuyor.')).toBeVisible();
});

for (const width of [320, 375, 768, 1280]) {
  test(`home, products and populated cart fit a ${width}px viewport`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const noOverflow = async () => {
      await expect.poll(() => page.evaluate(() =>
        document.documentElement.scrollWidth <= document.documentElement.clientWidth
      )).toBe(true);
    };
    await expect(page.getByRole('heading', { name: 'Yeni Sezon Ürünlerini Keşfedin' })).toBeVisible();
    await noOverflow();
    // Detect missing Tailwind output as well as overflowing layouts.
    const action = page.getByRole('button', { name: 'Alışverişe Başla' });
    await expect(action).toHaveCSS('border-radius', '12px');
    await action.click();
    await expect(page.getByRole('heading', { name: 'Tüm Ürünler' })).toBeVisible();
    await noOverflow();
    await page.getByRole('button', { name: 'Sepete Ekle', exact: true }).nth(4).click();
    await page.getByRole('button', { name: /^🛒 Sepet/ }).click();
    await expect(page.getByRole('heading', { name: 'Uzaktan Kumandalı Araba', exact: true })).toBeVisible();
    await noOverflow();
    const checkout = page.getByRole('button', { name: 'Siparişi Tamamla' });
    await checkout.scrollIntoViewIfNeeded();
    await expect(checkout).toBeInViewport();
    await testInfo.attach(`cart-${width}px`, {
      body: await page.screenshot({ fullPage: true }), contentType: 'image/png',
    });
  });
}
