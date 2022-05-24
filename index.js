const pupeteer = require("puppeteer");

function orderList(name, price, rating) {
  let new_list = [];
  for (let i = 0; i < name.length; i++) {
    new_list.push({
      Name: name[i],
      Price: price[i],
      Rating: rating[i],
    });
  }
  return new_list;
}

// Parameter passed in here is a list of strings
function createOrderedList(list) {
  let new_listRating = [];
  let new_listSize = [];
  // Debugging for looping over objects, not arrays!
  for (let i = 0; i < Object.values(list).length; i += 2) {
    new_listRating.push(Object.values(list)[i]);
  }
  for (let j = 1; j < Object.values(list).length; j += 2) {
    new_listSize.push(Object.values(list)[j]);
  }

  return [new_listRating, new_listSize];
}

async function getItem() {
  const browser = await pupeteer.launch({
    // Launch the pupeteer browser without seeing what the script is doing
    headless: true,
  });
  const page = await browser.newPage();
  await page.goto("https://www.amazon.ca/s?k=gaming+mouse&ref=nb_sb_noss", {
    waitUntil: "domcontentloaded", // Wait until dom loaded
  });
  await page.waitForSelector(".a-section.a-spacing-base", {
    visible: true,
    // Wait for item cards to be loaded
  });

  const grabItemName = await page.evaluate(() => {
    let item_Name = [];
    let item_Price = [];
    let item_Rating = [];

    const itemCard = document.querySelectorAll(
      // Grab the card that contains all information about the item
      ".a-section.a-spacing-base"
    );
    const itemCardFiltered = Array.from(itemCard).filter(
      (card) => !card.className.includes("s-shopping-adviser")
      // @@@ Get rid of amazon suggestions
    );

    itemCardFiltered.forEach((tag) => {
      if (
        tag.lastChild.childElementCount == 3 &&
        tag.querySelector(".a-row.a-size-small") == null
        // Make sure only rating missing
      ) {
        item_Rating.push("No rating"); // Add element without rating to the list
      } else if (tag.lastChild.childElementCount == 4) {
        tag.remove();
        item_Rating.push(tag.querySelector(".a-row.a-size-small").innerText);
        // Add element with rating to the list
      }

      if (
        tag.lastChild.childElementCount == 3 &&
        tag.querySelector(
          ".a-size-mini.a-spacing-none.a-color-base.s-line-clamp-3"
        ) == null
      ) {
        item_Name.push("No name"); // Push Element without name to list
      } else if (tag.lastChild.childElementCount == 4) {
        item_Name.push(
          tag.querySelector(
            ".a-size-mini.a-spacing-none.a-color-base.s-line-clamp-3"
          ).innerText
        );
      }
      const itemPrice = tag.querySelectorAll(".a-price");
      // @@@ Price needs to collect only current prices, not the 'was' prices as it is doing now
      //  Filter so that only the exact class element is chosen ### Fixed

      itemPrice.forEach((price) => {
        price.remove();
        // Make sure we're only selecting this exact class
        if (price.className == "a-price") {
          // If non-empty value, add to list
          if (price.innerText !== "") {
            // Avoid duplicative prices
            item_Price.push(price.firstChild.innerText);
          }
        }
      });
    });
    const result = orderList(item_Name, item_Price, item_Rating);
    const test = [];

    return [result];
    // @@@ Returning two things seem to mess somethiing up: innerText getting set to null?
    // @@@ ##Fix: Items were not loaded
    // @@@ Why do I have to return a list for this thing to be not null??
    // Using map?
  });
  console.dir(grabItemName, { maxArrayLength: null });
  await browser.close();
}

getItem();
