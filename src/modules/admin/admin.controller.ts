import { Controller, Get, Param, Patch, UseGuards, HttpStatus, ParseUUIDPipe, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { Role } from 'src/common/enums/role.enum';
import { Roles } from 'src/config/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/config/guards/jwt-auth.guard';
import { RolesGuard } from 'src/config/guards/roles.guard';

@ApiTags('Admin')
@ApiBearerAuth() // Indicates that JWT is required
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard) // Protect all routes in this controller
@Roles(Role.ADMIN) // Specify that only ADMIN role is allowed
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('organizations/unverified')
  @ApiOperation({ summary: 'Get all unverified organizations' })
  @ApiResponse({ status: 200, description: 'List of unverified organizations.' })
  getUnverifiedOrganizations() {
    return this.adminService.getUnverifiedOrganizations();
  }

  @Get('sponsors/unverified')
  @ApiOperation({ summary: 'Get all unverified sponsors' })
  @ApiResponse({ status: 200, description: 'List of unverified sponsors.' })
  getUnverifiedSponsors() {
    return this.adminService.getUnverifiedSponsors();
  }

  @Patch('organizations/:id/verify')
  @ApiOperation({ summary: 'Verify an organization' })
  @ApiParam({ name: 'id', description: 'Organization UUID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Organization verified successfully.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Organization not found.' })
  verifyOrganization(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.verifyOrganization(id);
  }

  @Patch('sponsors/:id/verify')
  @ApiOperation({ summary: 'Verify a sponsor' })
  @ApiParam({ name: 'id', description: 'Sponsor UUID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Sponsor verified successfully.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Sponsor not found.' })
  verifySponsor(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.verifySponsor(id);
  }

  @Delete('sponsors/:id')
  @ApiOperation({ summary: 'Delete a sponsor' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Sponsor deleted successfully.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Sponsor not found.' })
  deleteSponsor(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.deleteSponsor(id);
  }
  @Delete('organizations/:id')
  @ApiOperation({ summary: 'Delete an organization' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Organization deleted successfully.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Organization not found.' })
  deleteOrganization(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.deleteOrganization(id);
  } 
}