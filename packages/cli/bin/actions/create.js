import chalk from "chalk";
import { access, cp, mkdir, readFile, writeFile } from "fs/promises";
import inquirer from "inquirer";
import { Validator } from "jsonschema";
import ora from "ora";
import { resolve } from "path";
import { fileURLToPath } from "url";
import fetchSchema from "../functions/fetchSchema.js";
import getDiscordAppUser from "../functions/getDiscordAppUser.js";
import getDiscordUser from "../functions/getDiscordUser.js";
import getFolderLetter from "../functions/getFolderLetter.js";
import isFirstTimeAuthor from "../functions/isFirstTimeAuthor.js";
import { prefix } from "../util/prefix.js";
const v = new Validator();
const discordUser = await getDiscordAppUser();
const spinner = ora("Fetching Schema...").start();
const schema = await fetchSchema();
v.addSchema({ definitions: schema.definitions });
spinner.stop().clear();
let serviceAuthor;
const metadata = JSON.parse(await readFile(resolve(fileURLToPath(import.meta.url), "../../../template/metadata.json"), "utf8"));
const res = await inquirer.prompt([
    {
        name: "service",
        message: "Presence name",
        validate: async (input) => {
            if (!input)
                return "Presence name cannot be empty!";
            const schemaRes = v.validate(input, schema.properties.service);
            if (!schemaRes.valid)
                return schemaRes.errors[0].message;
            if (await serviceExists(input))
                return "Presence already exists!";
            return true;
        },
    },
    {
        name: "description",
        message: "English description of the Presence",
        validate: (input) => {
            if (!input)
                return "Description cannot be empty!";
            const schemaRes = v.validate({ en: input }, schema.properties.description);
            if (!schemaRes.valid)
                return schemaRes.errors[0].message;
            return true;
        },
    },
    {
        name: "author",
        message: "Discord ID of the author",
        default: discordUser?.id,
        validate: async (input) => {
            if (!input)
                return "Author cannot be empty!";
            const schemaRes = v.validate({ id: input, name: "" }, schema.properties.author);
            if (!schemaRes.valid)
                return schemaRes.errors[0].message;
            serviceAuthor = discordUser ?? (await getDiscordUser(input));
            if (!serviceAuthor)
                return "User not found.";
            metadata.author = {
                id: input,
                name: serviceAuthor.username,
            };
            return true;
        },
        transformer: (input) => {
            return serviceAuthor ? serviceAuthor.username : input;
        },
    },
    {
        name: "url",
        message: "URL of the website (separate multiple URLs with a comma)",
        validate: (input) => {
            if (!input)
                return "URL cannot be empty!";
            let urls;
            if (input.split(",").length > 1)
                urls = input.split(",");
            else
                urls = input;
            const schemaRes = v.validate(urls, schema.properties.url);
            if (!schemaRes.valid)
                return schemaRes.errors[0].message;
            return true;
        },
    },
    {
        name: "logo",
        message: "Image URL of the logo",
        validate: (input) => {
            if (!input)
                return "Logo cannot be empty!";
            const schemaRes = v.validate(input, schema.properties.logo);
            if (!schemaRes.valid)
                return schemaRes.errors[0].message;
            return true;
        },
    },
    {
        name: "thumbnail",
        message: "Image URL of the thumbnail",
        validate: (input) => {
            if (!input)
                return "Thumbnail cannot be empty!";
            const schemaRes = v.validate(input, schema.properties.thumbnail);
            if (!schemaRes.valid)
                return schemaRes.errors[0].message;
            return true;
        },
    },
    {
        name: "color",
        message: "Theme color of the Presence",
        validate: (input) => {
            if (!input)
                return "Color cannot be empty!";
            const schemaRes = v.validate(input, schema.properties.color);
            if (!schemaRes.valid)
                return schemaRes.errors[0].message;
            return true;
        },
    },
    {
        name: "tags",
        message: "Tags of the Presence (separate multiple tags with a comma)",
        validate: (input) => {
            if (!input)
                return "Tags cannot be empty!";
            const schemaRes = v.validate(input.split(","), schema.properties.tags);
            if (!schemaRes.valid)
                return schemaRes.errors[0].message;
            return true;
        },
    },
    {
        name: "category",
        message: "Category of the service",
        type: "list",
        choices: schema.properties.category.enum,
    },
]);
const presencePath = resolve(`./websites/${getFolderLetter(res.service)}/${res.service.replace("!", " ").trim()}`);
await mkdir(resolve(presencePath, "dist"), {
    recursive: true,
});
metadata.service = res.service;
metadata.description = { en: res.description };
metadata.author = {
    id: res.author,
    name: serviceAuthor.username,
};
metadata.url = res.url.split(",").length > 1 ? res.url.split(",") : res.url;
metadata.logo = res.logo;
metadata.thumbnail = res.thumbnail;
metadata.color = res.color;
metadata.tags = res.tags.split(",");
metadata.category = res.category;
metadata.version = "1.0.0";
await writeFile(resolve(presencePath, "metadata.json"), JSON.stringify(metadata, null, "\t"));
await cp(resolve(fileURLToPath(import.meta.url), "../../../template/tsconfig.json"), resolve(presencePath, "tsconfig.json"));
const presenceFileToCopy = (await isFirstTimeAuthor(res.author))
    ? "presence.ts"
    : "presence.min.ts";
await cp(resolve(fileURLToPath(import.meta.url), `../../../template/${presenceFileToCopy}`), resolve(presencePath, "presence.ts"));
console.log(prefix, chalk.green("Presence created! You can now start coding!"));
async function serviceExists(service) {
    try {
        await access(`./websites/${getFolderLetter(service)}/${service}`);
        return true;
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2FjdGlvbnMvY3JlYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sS0FBSyxNQUFNLE9BQU8sQ0FBQztBQUMxQixPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUNyRSxPQUFPLFFBQVEsTUFBTSxVQUFVLENBQUM7QUFDaEMsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUN2QyxPQUFPLEdBQUcsTUFBTSxLQUFLLENBQUM7QUFDdEIsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUMvQixPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sS0FBSyxDQUFDO0FBRXBDLE9BQU8sV0FBVyxNQUFNLDZCQUE2QixDQUFDO0FBQ3RELE9BQU8saUJBQWlCLE1BQU0sbUNBQW1DLENBQUM7QUFDbEUsT0FBTyxjQUFjLE1BQU0sZ0NBQWdDLENBQUM7QUFDNUQsT0FBTyxlQUFlLE1BQU0saUNBQWlDLENBQUM7QUFDOUQsT0FBTyxpQkFBaUIsTUFBTSxtQ0FBbUMsQ0FBQztBQUNsRSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFFM0MsTUFBTSxDQUFDLEdBQUcsSUFBSSxTQUFTLEVBQUUsQ0FBQztBQUUxQixNQUFNLFdBQVcsR0FBRyxNQUFNLGlCQUFpQixFQUFFLENBQUM7QUFFOUMsTUFBTSxPQUFPLEdBQUcsR0FBRyxDQUFDLG9CQUFvQixDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7QUFFbEQsTUFBTSxNQUFNLEdBQUcsTUFBTSxXQUFXLEVBQUUsQ0FBQztBQUVuQyxDQUFDLENBQUMsU0FBUyxDQUFDLEVBQUUsV0FBVyxFQUFFLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO0FBRWpELE9BQU8sQ0FBQyxJQUFJ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