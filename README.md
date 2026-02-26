A collection of utility packages.

# Building

To build the packages, run the following command:

```bash
pnpm run build
```

The building process now includes unit testing run and requires
connection to a MongoDB instance.

Create a `.env.local` file in the root of the project with the following content:

```env
DB_SUPERADMIN_USER=   
DB_SUPERADMIN_PASSWORD=   
DB_HOST=
DB_PORT=
DB_NAME=unit-testing
```

Fill in the values for your MongoDB instance.

# Testing

Run all tests across the monorepo:

```bash
pnpm turbo test
```

Run only `gdmn-utils` tests:

```bash
pnpm --filter gdmn-utils test
```