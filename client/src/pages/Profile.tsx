import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Calendar, Phone, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  birthDate: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function Profile() {
  const { user, updateProfile, isUpdatingProfile } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      birthDate: user?.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : "",
      bio: user?.bio || "",
      phoneNumber: user?.phoneNumber || "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : "",
        bio: user.bio || "",
        phoneNumber: user.phoneNumber || "",
      });
    }
  }, [user, form]);

  const onSubmit = (data: ProfileFormValues) => {
    updateProfile({
      ...data,
      birthDate: data.birthDate ? new Date(data.birthDate) : null,
    } as any, {
      onSuccess: () => {
        toast({
          title: t("profile.updated", { defaultValue: "Profile updated" }),
          description: t("profile.updatedDesc", { defaultValue: "Your personal information has been saved." }),
        });
      },
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
          {t("profile.title", { defaultValue: "My Profile" })}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t("profile.subtitle", { defaultValue: "Manage your personal information and preferences." })}
        </p>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            {t("profile.personalInfo", { defaultValue: "Personal Information" })}
          </CardTitle>
          <CardDescription>
            {t("profile.personalInfoDesc", { defaultValue: "These details are used to personalize your experience." })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t("profile.firstName", { defaultValue: "First Name" })}</Label>
                <Input id="firstName" {...form.register("firstName")} />
                {form.formState.errors.firstName && (
                  <p className="text-xs text-destructive">{form.formState.errors.firstName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{t("profile.lastName", { defaultValue: "Last Name" })}</Label>
                <Input id="lastName" {...form.register("lastName")} />
                {form.formState.errors.lastName && (
                  <p className="text-xs text-destructive">{form.formState.errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {t("profile.birthDate", { defaultValue: "Birth Date" })}
              </Label>
              <Input id="birthDate" type="date" {...form.register("birthDate")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                {t("profile.phoneNumber", { defaultValue: "Phone Number" })}
              </Label>
              <Input id="phoneNumber" type="tel" {...form.register("phoneNumber")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                {t("profile.bio", { defaultValue: "Bio" })}
              </Label>
              <Textarea 
                id="bio" 
                {...form.register("bio")} 
                placeholder={t("profile.bioPlaceholder", { defaultValue: "Tell us a bit about your gardening journey..." })}
                className="min-h-[100px]"
              />
            </div>

            <Button type="submit" className="w-full h-11" disabled={isUpdatingProfile}>
              {isUpdatingProfile && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t("profile.save", { defaultValue: "Save Changes" })}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
