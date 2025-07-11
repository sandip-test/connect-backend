import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangesInEntity1752222481398 implements MigrationInterface {
    name = 'ChangesInEntity1752222481398'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sponsors" DROP COLUMN "years_of_establishment"`);
        await queryRunner.query(`ALTER TABLE "organizations" DROP COLUMN "years_of_establishment"`);
        await queryRunner.query(`ALTER TABLE "sponsors" ADD "year_of_establishment" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sponsors" ADD "company_logo_public_id" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "sponsors" ADD "registration_certificate_public_id" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "organizations" ADD "year_of_establishment" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "organizations" ADD "organization_logo_public_id" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "organizations" ADD "registration_certificate_public_id" character varying(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organizations" DROP COLUMN "registration_certificate_public_id"`);
        await queryRunner.query(`ALTER TABLE "organizations" DROP COLUMN "organization_logo_public_id"`);
        await queryRunner.query(`ALTER TABLE "organizations" DROP COLUMN "year_of_establishment"`);
        await queryRunner.query(`ALTER TABLE "sponsors" DROP COLUMN "registration_certificate_public_id"`);
        await queryRunner.query(`ALTER TABLE "sponsors" DROP COLUMN "company_logo_public_id"`);
        await queryRunner.query(`ALTER TABLE "sponsors" DROP COLUMN "year_of_establishment"`);
        await queryRunner.query(`ALTER TABLE "organizations" ADD "years_of_establishment" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sponsors" ADD "years_of_establishment" integer NOT NULL`);
    }

}
